import { generators } from '../core.generator';

generators.roomGenerators.addGenerator("my-generator", (gen) => {
    return {
        roomIds: gen.fill(new Array(), { bounds: gen.bounds, value: (x, y) => (Math.random() * 4) | 0; }),
        floors:  gen.tiles.random,
        height:  gen.fill(new Array(), { bounds: gen.bounds, value: 0 }),
    };
});
