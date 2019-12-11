cmake_minimum_required(VERSION 3.7)

project(dungeon-generator)

find_package(glfw3 REQUIRED)
find_package(OpenGL REQUIRED)

add_executable(dungeon-generator cppsrc/main.cpp)
target_link_libraries(dungeon-generator glfw ${GLFW_LIBRARIES})
