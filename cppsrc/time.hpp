#pragma once

struct Time {
    static double time;
    static double dt;
    static double getFps () { return 1.0 / Time::dt; }
};

#ifdef CPP_STATICS
    double Time::time = 0;
    double Time::dt = 0;
#endif
