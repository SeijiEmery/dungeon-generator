#include <GLFW/glfw3.h>
#include <cstdlib>
#include <cstdio>
#include <exception>
#include <stdexcept>
#include <cstdarg>
#include <string>

#define WINDOW_WIDTH 800
#define WINDOW_HEIGHT 600

#define ENFORCE_CRITICAL(expr, ...) \
    if (!(expr)) { \
        fprintf(stderr, __VA_ARGS__); \
        exit(-1); \
    }

std::string format(const char* fmt, ...) {
    char buf[4096];
    va_list args;
    va_start (args, fmt);
    snprintf(buf, sizeof(buf) / sizeof(buf[0]), fmt, args);
    va_end(args);
    return std::string { &buf[0] };
}

#define THROW(...) throw std::runtime_error(format(__VA_ARGS__))

int main(int argc, char *argv[]) {
    if (!glfwInit()) {
        fprintf(stderr, "Failed to initialize glfw!\n");
        exit(-1);
    }
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
    glfwWindowHint(GLFW_DOUBLEBUFFER, GL_TRUE);
    GLFWwindow* window = glfwCreateWindow(
        WINDOW_WIDTH, WINDOW_HEIGHT,
        "dungeon-generator", NULL, NULL);
    if (window == nullptr) {
        fprintf(stderr, "Failed to create GLFW window\n");
        exit(-1);
    }

    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);

    ENFORCE_CRITICAL(window != nullptr,
        "Failed to create GLFW window");

    try {
        while (!glfwWindowShouldClose(window)) {
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            glfwSwapBuffers(window);
            glfwPollEvents();
        }
        THROW("fubar %s %d %0.2f", "bar", 10, 0.25);
        throw std::runtime_error("fubar");
    } catch (const std::exception& e) {
        fprintf(stderr, "terminated with error:\n\t%s\n", e.what());
    }
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}