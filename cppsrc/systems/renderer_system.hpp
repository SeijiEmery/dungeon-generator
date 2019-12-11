#pragma once
#include "../utils/all_includes.hpp"

struct RendererSystem {
    RendererSystem () {
        printf("init renderer!\n");
    }
    ~RendererSystem () {
        printf("teardown renderer!\n");
    }
    void update () {
        printf("update renderer!\n");

        int* foo = nullptr;
        *foo = 10;

        // ENFORCE(false, "error %d!", -1);
    }
};
