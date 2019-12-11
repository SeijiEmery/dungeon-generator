#pragma once
#include "../config.hpp"
#include "format.hpp"
#include <exception>
#include <stdexcept>
#include <string>
#include <cstdio>
#include <vector>

#define THROW(...) throw backtraced_exception(format(__VA_ARGS__))
#define ENFORCE(expr, ...) if (!(expr)) { THROW(__VA_ARGS__); }

static void errorCallback(int error, const char* description) {
    fprintf(stderr, "GLFW error %d: %s\n", error, description);
}

#ifdef SHOW_BACKTRACE
    #include <execinfo.h>
    #include <unistd.h>
    #include <signal.h>
    #include <string.h>

    typedef std::vector<void*> TraceInfo;
    TraceInfo getBacktrace () {
        TraceInfo traceInfo (10, nullptr);
        traceInfo.resize(backtrace(&traceInfo[0], traceInfo.size()));
        return traceInfo;
    }
    void printBacktrace (const TraceInfo traceInfo) {
        backtrace_symbols_fd(&traceInfo[0], traceInfo.size(), STDERR_FILENO);
    }

    #ifdef CPP_STATICS
        static const char* signalName (int sig) {
            switch (sig) {
                case SIGSEGV: return "SIGSEGV";
                default: return strsignal(sig);
            }
        }
        static void signalHandler(int sig) {
            fprintf(stderr, "Error: signal %d: %s:\n", sig, signalName(sig));
            printBacktrace(getBacktrace());
            exit(1);
        }
        static void maybeSetupSignalHandlers () {
            signal(SIGSEGV, signalHandler);
        }
    #endif
#else
    typedef void* TraceInfo;
    TraceInfo getBacktrace() { return nullptr; }
    void printBacktrace(TraceInfo info) {}

    #ifdef CPP_STATICS
        static void maybeSetupSignalHandlers () {}
    #endif
#endif


class backtraced_exception : std::runtime_error {
    TraceInfo traceInfo;
public:
    backtraced_exception (const std::string& what)
        : std::runtime_error(what)
        , traceInfo(getBacktrace())
    {}
    void printBacktrace () const {
        fprintf(stderr, "terminated with error:\n\t%s\n", what());
        ::printBacktrace(traceInfo);
    }
};
