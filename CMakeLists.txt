cmake_minimum_required(VERSION 3.7)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(APPLE)
    add_definitions(-DGL_SILENCE_DEPRECATION)
endif(APPLE)

project(dungeon-generator)
set(TARGET_NAME dungeon-generator)

find_package(glfw3 REQUIRED)
find_package(OpenGL REQUIRED)

# search for pkg-config
include (FindPkgConfig)
if (NOT PKG_CONFIG_FOUND)
    message (FATAL_ERROR "pkg-config not found")
endif ()

# check for libpng
pkg_check_modules (LIBPNG libpng16 REQUIRED)
if (NOT LIBPNG_FOUND)
    message(FATAL_ERROR "You don't seem to have libpng16 development libraries installed")
else ()
    include_directories (${LIBPNG_INCLUDE_DIRS})
    link_directories (${LIBPNG_LIBRARY_DIRS})
    link_libraries (${LIBPNG_LIBRARIES})
endif ()

add_executable(${TARGET_NAME} cppsrc/main.cpp)
target_include_directories(${TARGET_NAME} PUBLIC ${OPENGL_INCLUDE_DIR})
target_link_libraries(${TARGET_NAME} ${OPENGL_gl_LIBRARY})
target_link_libraries(${TARGET_NAME} glfw ${GLFW_LIBRARIES})
