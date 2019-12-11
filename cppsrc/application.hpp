#pragma once
#include <GLFW/glfw3.h>
#include "utils/error_utils.hpp"
#include "all_systems.hpp"
#include "config.hpp"

template <typename... Systems>
class Application {
    GLFWwindow* window = nullptr;
public:
    Application () {
        ENFORCE(glfwInit(), "Failed to initialize glfw!");
        glfwSetErrorCallback(errorCallback);

        glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
        glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
        glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
        glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
        glfwWindowHint(GLFW_DOUBLEBUFFER, GL_TRUE);
        window = glfwCreateWindow(
            WINDOW_WIDTH, WINDOW_HEIGHT,
            "dungeon-generator", NULL, NULL);
        ENFORCE(window != nullptr, "Failed to create GLFW window\n");
    }
    ~Application() {
        if (!window) { glfwDestroyWindow(window); }
        glfwTerminate();
    }
    void run () {
        glfwMakeContextCurrent(window);
        glfwSwapInterval(1);

        SystemRunner<Systems...>::init();
        glfwPollEvents();

        while (!glfwWindowShouldClose(window)) {
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            SystemRunner<Systems...>::update();
            printf("time = %0.2lf, dt = %0.2lf, fps = %0.1lf\n",
                Time::time, Time::dt, 1.0 / Time::dt);
            
            glfwSwapBuffers(window);
            glfwPollEvents();
        }
    }
};
