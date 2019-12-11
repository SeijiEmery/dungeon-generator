#pragma once
#include <string>
#include <cstdio>
#include <cstdarg>

std::string format(const char* fmt, ...) {
    char buf[4096];
    va_list args;
    va_start (args, fmt);
    snprintf(buf, sizeof(buf) / sizeof(buf[0]), fmt, args);
    va_end(args);
    return std::string { &buf[0] };
}