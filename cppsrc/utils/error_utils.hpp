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
    #ifdef TRY_DEMANGLING_CXX_NAMES_IN_BACKTRACES
        #include <cxxabi.h>
    #endif

    typedef std::vector<void*> TraceInfo;
    TraceInfo getBacktrace () {
        TraceInfo traceInfo (10, nullptr);
        traceInfo.resize(backtrace(&traceInfo[0], traceInfo.size()));
        return traceInfo;
    }

    // credit for backtrace demangling: 
    // http://charette.no-ip.com:81/programming/2010-01-25_Backtrace/
    void printBacktrace (const TraceInfo traceInfo) {
        char** symbols = backtrace_symbols(&traceInfo[0], traceInfo.size());
        for (size_t i = 0; i < traceInfo.size(); ++i) {
            #ifdef TRY_DEMANGLING_CXX_NAMES_IN_BACKTRACES

                // assume mangled names start with '_Z'
                char* mangledNameStart = strstr(symbols[i], "_Z");
                if (mangledNameStart != nullptr) {
                    // printf("Found manged name: %s\n", mangledNameStart);

                    // and end with a space
                    char* mangledNameEnd = strstr(mangledNameStart, " ");
                    if (mangledNameEnd) { *mangledNameEnd = '\0'; }
                    int status = -1;

                    // use abi::__cxz_demangle() to demangle a mangled c++ name
                    char* name = abi::__cxa_demangle(mangledNameStart, NULL, NULL, &status);
                    if (status == 0) {

                        // this uses horrific string searching + mangling
                        // to print 3 string ranges with 2 string buffers...
                        // but, this works...
                        //
                        // (note: abi::__cxa_demangle will return an error if it's
                        // not given a string that points -exactly- to the start + end
                        // of a c++ mangled string, which we can achieve by finding
                        // the start + end of the mangled name, swapping out the space 
                        // character at the end of the mangled name with '\0' and back,
                        // and swapping out the character at the start of the mangled name
                        // before we print it, ie. printing out 3 things:
                        //      - stuff before the mangled name
                        //      - demangled name
                        //      - stuff after the mangled name
                        // )

                        *mangledNameStart = '\0';
                        if (mangledNameEnd) { *mangledNameEnd = ' '; }
                        fprintf(stderr, "%s%s%s\n", symbols[i], name, mangledNameEnd);
                    } else {
                        fprintf(stderr, "%s\n", symbols[i]);
                    }
                    // result must be freed
                    free(name);
                } else {
                    fprintf(stderr, "%s\n", symbols[i]);
                }
            #else
                fprintf(stderr, "%ld: %s [%p]\n", i, symbols[i], traceInfo[i]);
            #endif
        }
        free(symbols);
        // backtrace_symbols_fd(&traceInfo[0], traceInfo.size(), STDERR_FILENO);
    }

    #ifdef CPP_STATICS
        static const char* signalName (int sig) {
            switch (sig) {
                case SIGSEGV: return "SIGSEGV";
                default: return strsignal(sig);
            }
        }
        static void signalHandler(int sig) {
            fprintf(stderr, "Error: %s (signal %d):\n", signalName(sig), sig);
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
