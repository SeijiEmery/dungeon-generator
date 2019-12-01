
export class MapGeneratorInterface {
    // Draws a line of value(s) from (p0.x, p0.y) to (p1.x, p1.y)
    drawLine: function(p0, p1, value) { throw "Unimplemented!"; }

    // Draws a rectangle of value(s) from (p0.x, p0.y) to (p1.x, p1.y)
    drawRect: function(p0, p1, value) { throw "Unimplemented!"; }

    // interpolate between two values
    // allowed args:
    //      { from: value | generator, to: value | generator }
    //      { from: value | generator, by: value | callback }
    // where 
    //      value     : valid index | undefined
    //      generator : () => value
    //      callback  : (i : int >= 0) => value 
    //
    interp: function(args) {}

    constructor (tiles, bounds) {
        // this.floors = new MapTileInterface(tiles.floor, bounds);
        // this.walls = new MapTileInterface(tiles.walls, bounds.add({ x: 1, y: 1 }));
        // this.height = new MapTileInterface(new HeightGen(), bounds);
        this.bounds = bounds;
    }
}

class MapTileInterface {
    // Get a tile index, or 'undefined'. Valid tile indices are [1, tiles.length+1]
    get: function(name) { throw "Unimplemented!"; }

    // returns a generator that returns random values
    random: function() { return this.genRandom; }

    genRandom: function() { return 1 + (Math.random() * this.tiles.length) | 0; }
}


export function addGenerator (name, generatorFcn) {
    registerGenerator(name, generatorFcn);
    throw "Unimplemented!";
}

function exampleUsage () {
    include { generators } from '../core.generator';
    generators.roomGenerators.addGenerator("my-generator", (gen) => {
        return {
            rooms:  gen.fill(new Array(), { bounds: gen.bounds, value: (x, y) => (Math.random() * 4) | 0; }),
            height: gen.fill(new Array(), { bounds: gen.bounds, value: 0 }),
        };
    });
}
