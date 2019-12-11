#pragma once
#include "../utils/all_includes.hpp"

struct RendererSystem {
    RendererSystem () {
        printf("init renderer!\n");
    }
    void update () {
        printf("update renderer!\n");
    }
};
