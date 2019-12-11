#pragma once
#include "../utils/all_includes.hpp"
#include "../utils/load_png.hpp"
#include <unordered_map>

#ifdef __APPLE__
#include <OpenGL/gl3.h>
#include <OpenGL/gl3ext.h>
#endif

DEFINE_EXCEPTION(GLRuntimeException)
DEFINE_EXCEPTION(ShaderCompileException)
DEFINE_EXCEPTION(ShaderLinkException)
DEFINE_EXCEPTION(TextureLoadException)

static const char* VERTEX_SHADER_SRC = R"SHADER(
#version 410
in vec2 vertexPos;
out vec2 texCoord;
uniform float width;
uniform float height;

void main () {
    texCoord = vertexPos + vec2(0.5, 0.5);
    gl_Position = vec4(
        vertexPos.x * width / 800,
        vertexPos.y * height / 600, 
        0.0, 1.0);
}
)SHADER";

static const char* FRAGMENT_SHADER_SRC = R"SHADER(
#version 410
out vec4 fragColor;
in vec2 texCoord;
uniform sampler2D tex;
void main () {
    fragColor = texture(tex, texCoord);
    fragColor.rgb *= fragColor.a;
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
    std::unordered_map<std::string, GLuint> uniformLocations;
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
    GLuint get () { assert(program); return program; }
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
    void bind () {
        glUseProgram(program);
    }
    template <typename T>
    void setUniform (const std::string& name, const T& value) {
        auto it = uniformLocations.find(name);
        if (it != uniformLocations.end()) {
            setUniform(it->second, value);
        } else {
            auto uniformLocation = glGetUniformLocation(program, name.c_str());
            uniformLocations[name] = uniformLocation;
            setUniform(uniformLocation, value);
        }
    }
private:
    #define DEFN_UNIFORM_SET1V(Type, fcn) \
        void setUniform(GLuint loc, Type value) { \
            fcn(loc, value); glCheckErrors(#fcn); \
        }
    DEFN_UNIFORM_SET1V(int, glUniform1i)
    DEFN_UNIFORM_SET1V(float, glUniform1f)

    #undef DEFN_UNIFORM_SET1V
};

class VBO {
    GLuint buffer = 0;
    GLenum target = 0;
public:
    void create (GLenum bufferTarget) {
        assert(!buffer);
        target = bufferTarget;
        glGenBuffers(1, &buffer);
        glCheckErrors("glGenBuffers");
    }
    void bind () {
        if (buffer) {
            glBindBuffer(target, buffer);
            glCheckErrors("glBindBuffer");
        }
    }
    void load (GLenum bufferTarget, GLenum usage, size_t size, const void* data) {
        create(bufferTarget);
        bind();
        glBufferData(bufferTarget, size, data, usage);
        glCheckErrors("glBufferData");
    }
    void destroy () {
        if (buffer) {
            glDeleteBuffers(1, &buffer);
            glCheckErrors("glDeleteBuffers");
        }  
    }
    ~VBO () {
        destroy();
    }
};

class QuadMesh {
    VBO vertices, indices;
    GLuint vao;

    constexpr static GLfloat VERTICES[] = { 
        -0.5, -0.5, 
        -0.5, +0.5,
        +0.5, +0.5,
        -0.5, -0.5,
        +0.5, +0.5,
        +0.5, -0.5,
    };
    constexpr static GLubyte INDICES[] = {
        0, 1, 2, 0, 2, 3
    };
public:
    void load () {
        glGenVertexArrays(1, &vao); glCheckErrors("glGenVertexArrays");
        glBindVertexArray(vao); glCheckErrors("glBindVertexArray");    
        vertices.load( GL_ARRAY_BUFFER, GL_STATIC_DRAW, sizeof(VERTICES), &VERTICES[0] );
        glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 0, NULL); glCheckErrors("glVertexAttribPointer");
        glEnableVertexAttribArray(0); glCheckErrors("glEnableVertexAttribArray");
        glBindVertexArray(0); glCheckErrors("glBindVertexArray");
    }
    void bind () {
        glBindVertexArray(vao); glCheckErrors("glBindVertexArray");
    }
    void draw () {
        glDrawArrays(GL_TRIANGLES, 0, 6); glCheckErrors("glDrawArrays");
    }
};

class Texture {
    GLuint tex = 0;
    int width, height;
public:
    void load (const std::string& path) {
        if (!tex) {
            glGenTextures(1, &tex); glCheckErrors("glGenTextures");
        }
        glBindTexture(GL_TEXTURE_2D, tex); glCheckErrors("glBindTexture");
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER); glCheckErrors("glTexParameteri");
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER); glCheckErrors("glTexParameteri");
        float color[] = { 0.0f, 0.0f, 0.0f, 0.0f };
        glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, color); glCheckErrors("glTexParameterfv");
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR); glCheckErrors("glTexParameteri");
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR); glCheckErrors("glTexParameteri");

        unsigned char* imageData;
        bool hasAlpha = true;
        if (loadPngImage(path.c_str(), width, height, hasAlpha, &imageData)) {
            printf("loaded png data!\n");
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA,
                      GL_UNSIGNED_BYTE, imageData); glCheckErrors("glTexImage2D");
            glGenerateMipmap(GL_TEXTURE_2D); glCheckErrors("glGenerateMipmap");
            free(imageData);
        } else {
            ENFORCE_WITH(TextureLoadException, false, "Could not load image '%s'", path.c_str());
        }
    }
    void bind (ShaderProgram& program, const std::string& name, int location = 0) {
        glActiveTexture(GL_TEXTURE0 + location); glCheckErrors("glActiveTexture");
        glBindTexture(GL_TEXTURE_2D, tex); glCheckErrors("glBindTexture");
        program.setUniform(name, location);
        program.setUniform("width", (float)width);
        program.setUniform("height", (float)height);
    }
};

struct RendererSystem {
    ShaderProgram program;
    Texture texture;
    QuadMesh quad;

    RendererSystem () {
        printf("running on opengl %s\n", glGetString(GL_VERSION));
        program.load(VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
        quad.load();
        texture.load("assets/assets_kenny_dungeon_pack/Isometric/barrel_E.png");
        printf("init renderer!\n");
    }
    void update () {
        printf("update renderer!\n");
        program.bind();
        texture.bind(program, "texture", 0);
        quad.bind();
        quad.draw();
    }
    ~RendererSystem () {
        printf("teardown renderer!\n");
    }
};
