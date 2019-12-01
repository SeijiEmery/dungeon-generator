
export function runOnce (f) {
    return typeof(f) === 'function' ?
        (function() { 
            let init = false; 
            return function () { 
                if (!init) {
                    init = true;
                    return f.apply(this, arguments);
                }
            };
        })() : null;
}

// Composes two functions sequentially together, iff non-null
// (runs f, then g)
// Optimized:
//      composeSequential(null, null)   ===     null
//      composeSequential(f,    null)   ===     f
//      composeSequential(null, g)      ===     g
//      composeSequential(f,    g)      ==>     f, g
//
export function composeSequential (f, g) {
    return typeof(f) === 'function' && typeof(g) === 'function'
        ? function() { 
            f.apply(this, arguments); 
            return g.apply(this, arguments); 
        }
        : typeof(f) === 'function' ? f
        : typeof(g) === 'function' ? g
        : null
    ;
}

export function compose (f, g) {
    return typeof(f) === 'function' && typeof(g) === 'function'
        ? function() {
            return f.call(this, g.apply(this, arguments));
        }
        : typeof(f) === 'function' ? f
        : typeof(g) === 'function' ? g
        : null
    ;
}
