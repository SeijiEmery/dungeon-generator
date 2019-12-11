#pragma once
#include <GLFW/glfw3.h>
#include "../time.hpp"

struct TimeSystem {
    static void init () {
        Time::time = glfwGetTime();
    }
    static void update () {
        auto t0 = Time::time;
        Time::time = glfwGetTime();
        Time::dt = Time::time - t0;
    }
};
