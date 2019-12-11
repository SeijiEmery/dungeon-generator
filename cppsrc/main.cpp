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
#define ENFORCE(expr, ...) if (!(expr)) { THROW(__VA_ARGS__); }

static void errorCallback(int error, const char* description) {
    fprintf(stderr, "GLFW error %d: %s\n", error, description);
}

struct Time {
    static double time;
    static double dt;
};
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

struct RenderSystem {
    static void init () {}
    static void udpate () {}
};

#define SYSTEMS \
    TimeSystem, \
    RenderSystem, \

template <typename... Systems>
struct SystemRunner;

template <>
struct SystemRunner<> {
    template <typename... Args>
    static void init (Args... args) {}
    template <typename... Args>
    static void update (Args... args) {}
};
template <typename S, typename... Systems>
struct SystemRunner<S, Systems...> {
    template <typename... Args>
    static void init (Args... args) { S::init(args...); SystemRunner<Systems...>::init(args...); }
    template <typename... Args>
    static void update (Args... args) { S::update(args...); SystemRunner<Systems...>::update(args...); }
};

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

        while (!glfwWindowShouldClose(window)) {
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            SystemRunner<Systems...>::update();
            
            glfwSwapBuffers(window);
            glfwPollEvents();
        }
    }
};

int main(int argc, char *argv[]) {
    try {
        Application().run();
    } catch (const std::exception& e) {
        fprintf(stderr, "terminated with error:\n\t%s\n", e.what());
        exit(-1);
    }
    return 0;
}