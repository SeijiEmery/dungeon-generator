#pragma once
#include "../utils/all_includes.hpp"

DEFINE_EXCEPTION(GLRuntimeException)
DEFINE_EXCEPTION(ShaderCompileException)
DEFINE_EXCEPTION(ShaderLinkException)

static const char* VERTEX_SHADER_SRC = R"SHADER(
#version 410
uniform mat4 MVP;
in vec3 vertexPos;

void main () {
    gl_Position = MVP * vec4(vertexPos, 1.0);
}
)SHADER";

static const char* FRAGMENT_SHADER_SRC = R"SHADER(
#version 410
out vec4 fragColor;
void main () {
    fragColor = vec4(1, 0, 1, 1);
}
)SHADER";


static const char* glErrorToStr (int err) {
    #define CASE(x) case x: return #x; break;
    switch (err) {
        CASE(GL_NO_ERROR)
        CASE(GL_INVALID_ENUM)
        CASE(GL_INVALID_VALUE)
        CASE(GL_INVALID_OPERATION)
        // CASE(GL_INVALID_FRAMEBUFFER_OPERATION)
        CASE(GL_OUT_OF_MEMORY)
        CASE(GL_STACK_UNDERFLOW)
        CASE(GL_STACK_OVERFLOW)
        default: return "unknown error";
    }
    #undef CASE
}

static void _glCheckErrors(const char* info, const char* file, int line) {
    int error = glGetError();
    ENFORCE_WITH(GLRuntimeException, error == GL_NO_ERROR, 
        "%s:%d OpenGL error after %s: %s (%d)", 
        file, line, info, glErrorToStr(error), error);
}
#define glCheckErrors(info) _glCheckErrors(info, __FILE__, __LINE__)

class ShaderProgram {
    GLuint program = 0;
private:
    static GLuint createAndCompileShader (const char* shaderSrc, GLenum shaderType) {
        GLuint shader = glCreateShader(shaderType);
        glCheckErrors("glCreateShader");

        glShaderSource(shader, 1, &shaderSrc, nullptr);
        glCheckErrors("glShaderSource");

        glCompileShader(shader);
        glCheckErrors("glCompileShader");

        int rv = -1;
        glGetShaderiv(shader, GL_COMPILE_STATUS, &rv);
        glCheckErrors("glGetShaderiv");
        if (rv != GL_TRUE) {
            char buf[4096];
            int length = 0;
            glGetShaderInfoLog(shader, sizeof(buf)/sizeof(buf[0]), &length, &buf[0]);
            glCheckErrors("glGetShaderInfoLog");

            glDeleteShader(shader);
            glCheckErrors("glDeleteShader");

            ENFORCE_WITH(ShaderCompileException, false, "shader compile error:\n%s\n%s\n", 
                shaderSrc, &buf[0]);
        }
        return shader;
    }
public:
    void load (const char* vertex, const char* fragment) {
        GLuint vertexShader = createAndCompileShader(vertex, GL_VERTEX_SHADER);
        GLuint fragmentShader = createAndCompileShader(fragment, GL_FRAGMENT_SHADER);
        printf("got shaders: %d %d\n", vertexShader, fragmentShader);
        if (!program) {
            program = glCreateProgram();
            glCheckErrors("glCreateProgram");
        }

        glAttachShader(program, vertexShader); glCheckErrors("glAttachShader");
        glAttachShader(program, fragmentShader); glCheckErrors("glAttachShader");
        glLinkProgram(program); glCheckErrors("glLinkProgram");

        int rv = -1;
        glGetProgramiv(program, GL_LINK_STATUS, &rv);
        glCheckErrors("glGetProgramiv");
        if (rv != GL_TRUE) {
            char buf[4096];
            int length = 0;
            glGetProgramInfoLog(program, sizeof(buf)/sizeof(buf[0]), &length, &buf[0]);
            program = 0;
            ENFORCE_WITH(ShaderLinkException, false, "program link error:\n%s\n", &buf[0]);
        }
        glValidateProgram(program); glCheckErrors("glValidateProgram");

        glDeleteShader(fragmentShader); glCheckErrors("glDeleteShader");
        glDeleteShader(vertexShader); glCheckErrors("glDeleteShader");
    }
    ~ShaderProgram () {
        if (program) {
            glDeleteProgram(program); glCheckErrors("glDeleteProgram");
            program = 0;
        }
    }
};

struct RendererSystem {
    ShaderProgram program;
    GLuint quadVbo = 0;
    GLuint quadFbo = 0;

    RendererSystem () {
        printf("running on opengl %s\n", glGetString(GL_VERSION));
        program.load(VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
        printf("init renderer!\n");
    }
    ~RendererSystem () {
        printf("teardown renderer!\n");
    }
    void update () {
        printf("update renderer!\n");
    }
};
