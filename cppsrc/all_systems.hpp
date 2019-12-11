// all_systems.hpp
//
// Defines + hooks in 'systems' used in application.hpp
//  - lets us decompose our application / renderer into orthogonal parts
//  - systems consist of an:
//      - init() method (or constructor), called at startup
//      - update() method, called each frame
//      - teardown() method (or destructor), called when the application terminates
//
// To add a system to the game / application:
//  - add system to systems/<system-name>.hpp
//  - add to ALL_SYSTEMS
//  - iff singleton, add to CPP_STATICS block
//
// Static systems:
//      class <system-name> {
//          static void init () { ... }
//          static void update () { ... }
//      };
//
// Non-static system:
//      class <system-name> {
//          <system-name> () { ... }
//          void update () { ... }
//      };
//
// Non-static systems:
//  - must add SingletonOf< system-name >   to ALL_SYSTEMS
//  - must define a static instance variable in the statics block:
//      DEFINE_SINGLETON(<system-name>)
//
// For the full implementation of singletons, see utils/singleton.hpp
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

#define DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING(method) \
    template <typename... Args> static void method (Args... args)

#define DEFINE_FORWARDING_IMPL(method, instance, rest) \
    DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING(method) { \
        instance::method(args...); \
        SystemRunner<rest...>::method(args...); \
    }

template <>
struct SystemRunner<> {
    DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING(init) {}
    DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING(update) {}
    DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING(teardown) {}
};
template <typename S, typename... Systems>
struct SystemRunner<S, Systems...> {
    DEFINE_FORWARDING_IMPL(init, S, Systems)
    DEFINE_FORWARDING_IMPL(update, S, Systems)
    DEFINE_FORWARDING_IMPL(teardown, S, Systems)
};
#undef DEFINE_STATIC_METHOD_WITH_ARGUMENT_FORWARDING
#undef DEFINE_FORWARDING_IMPL
