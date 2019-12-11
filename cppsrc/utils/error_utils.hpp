#pragma once
#include "format.hpp"
#include <exception>
#include <stdexcept>
#include <string>
#include <cstdio>

#define THROW(...) throw std::runtime_error(format(__VA_ARGS__))
#define ENFORCE(expr, ...) if (!(expr)) { THROW(__VA_ARGS__); }

static void errorCallback(int error, const char* description) {
    fprintf(stderr, "GLFW error %d: %s\n", error, description);
}
