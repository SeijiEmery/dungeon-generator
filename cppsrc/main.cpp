#include <GLFW/glfw3.h>
#include <cstdlib>
#include <cstdio>

#define ENFORCE_CRITICAL(expr, ...) \
    if (!(expr)) { \
        fprintf(stderr, __VA_ARGS__); \
        exit(-1); \
    }

int main(int argc, char *argv[]) {
    ENFORCE_CRITICAL(
        glfwInit(), 
        "Failed to initialize glfw!");

    printf("Hello, world!");
    return 0;
}