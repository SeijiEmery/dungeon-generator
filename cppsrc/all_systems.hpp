#pragma once
#include "systems/time_system.hpp"
#include "systems/renderer_system.hpp"
#include "utils/singleton.hpp"

#define ALL_SYSTEMS \
    TimeSystem, \
    SingletonOf<RendererSystem>

#ifdef CPP_STATICS
    DEFINE_SINGLETON(RendererSystem)
#endif

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
