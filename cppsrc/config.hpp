#pragma once

#define WINDOW_WIDTH 800
#define WINDOW_HEIGHT 600

#if defined(__APPLE__) || defined(__linux__)
    #define SHOW_BACKTRACE
    #define TRY_DEMANGLING_CXX_NAMES_IN_BACKTRACES
#endif
