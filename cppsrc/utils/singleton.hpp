#pragma once
#include <memory>

template <typename T>
struct SingletonOf {
    static std::unique_ptr<T> instance;

    template <typename... Args>
    static void init (Args... args) { 
        instance = std::unique_ptr<T>(new T(args...));
    }
    template <typename... Args>
    static void update (Args... args) {
        instance->update(args...);
    }
};
#define DEFINE_SINGLETON(System) \
    template <> std::unique_ptr<System> SingletonOf<System>::instance = nullptr;
