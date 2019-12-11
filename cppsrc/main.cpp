#include <cstdio>
#include <exception>

// tell .hpp files to include their static variable impls in this .cpp file
#define CPP_STATICS
#include "application.hpp"
#include "all_systems.hpp"




int main(int argc, char *argv[]) {
    maybeSetupSignalHandlers();
    try {
        Application<ALL_SYSTEMS>().run();
    } catch (const backtraced_exception& e) {
        e.printBacktrace();
        return -1;
    } catch (const std::exception& e) {
        fprintf(stderr, "terminated with error:\n\t%s\n", e.what());
        return -1;
    }
    return 0;
}