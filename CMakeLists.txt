cmake_minimum_required(VERSION 3.7)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

project(dungeon-generator)
set(TARGET_NAME dungeon-generator)

find_package(glfw3 REQUIRED)
find_package(OpenGL REQUIRED)

add_executable(${TARGET_NAME} cppsrc/main.cpp)
target_link_libraries(${TARGET_NAME} glfw ${GLFW_LIBRARIES})
