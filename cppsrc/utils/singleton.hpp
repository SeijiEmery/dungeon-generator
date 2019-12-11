#pragma once
#include <cassert>

template <typename T>
struct SingletonOf {
    static T* instance;

    template <typename... Args>
    static void init (Args... args) { 
        assert(instance == nullptr);
        instance = new T(args...);
    }
    template <typename... Args>
    static void update (Args... args) {
        assert(instance != nullptr);
        instance->update(args...);
    }
    template <typename... Args>
    static void teardown (Args... args) {
        if (instance) delete instance;
        instance = nullptr;
    }
};
#define DEFINE_SINGLETON(System) \
    template <> System* SingletonOf<System>::instance = nullptr;
