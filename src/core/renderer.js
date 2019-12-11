import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { random, randInt, randIntRange, randomTile} from '../core/random'
import config from '../generated/config'


const WIDTH = config.dungeon.width;
const HEIGHT = config.dungeon.height;
const ROTATIONS = [ 'N', 'E', 'S', 'W' ];
const tileset = ASSETS_BY_CATEGORY;



function forEach2 (w, h, fcn) {
    for (let i = 0; i < w; ++i) {
        for (let j = 0; j < h; ++j) {
            fcn(i, j);
        }
    }
}
function fill (elems, w, h, gen) {
    elems = elems || new Array();
    let k = 0;
    for (let i = 0; i < w; ++i) {
        for (let j = 0; j < h; ++j) {
            if (k < elems.length) {
                elems[k] = gen(i, j);
            } else {
                elems.push(gen(i, j));
            }
            k += 1;
        }
    }
    return elems;
}
function toPixelSpace(x, y, z) {
    return { 
        x: CENTER_X - x * 128 + y * 128,
        y: CENTER_Y + x * 64  + y * 64    + z * 64,
    };
}

export function makeRenderer = (game, grid){
    const render = tileRenderer(game, WIDTH, HEIGHT, tileset);
    return () => {
        forEach2(WIDTH, HEIGHT, (i, j) => {
            render(i, j, floors, walls, objects, heights)
        });
    };
};

function tileRenderer (game, w, h, tileset) {
    const w2 = w / 2, h2 = h / 2;
    const drawTile = (x, y, tile, tileset) => {
        let i = Math.floor(tile / 4 - 1);
        let r = (tile % 4);
        if (i >= 0 && i < tileset.length) {
            tiles.push(game.add.image(x, y, 
            tileset[i]+'_'+ROTATIONS[r]));
        }
    };
    return function (i, j, floors, walls, objects, heights) {
    let k = i + j * w;
    let { x, y } = toPixelSpace(i - w2, j - h2, heights[k]);
    // floor
    drawTile(x, y, floors[k], tileset.floors);

    // north wall
    drawTile(x, y - 20, walls[i + 2 * j * (w + 1)] * 4 + 2, tileset.walls);

    // west wall
    drawTile(x, y - 20, walls[i + (2 * j + 1) * (w + 1)] * 4 + 1, tileset.walls);

    // object
    drawTile(x, y, objects[k], tileset.objects);

    // south wall
    drawTile(x, y - 20, walls[i + 1 + (2 * j + 1) * (w + 1)] * 4 + 0, tileset.walls);

    // east wall
    drawTile(x, y - 20, walls[i + (2 * j + 2) * (w + 1)] * 4 + 3, tileset.walls);

    };
}

// Furthermore, tile indexing is as follows:
//   (i, j) => i + j * W
// 
const floors = fill(null, WIDTH, HEIGHT, () =>
    random() < 1 ? randomTile(tileset.floors) : 0
);

// Objects: objects / doodads that can be drawn on top of the sprites
const objects = fill(null, WIDTH, HEIGHT, () =>
    random() < 0.3 ? randomTile(tileset.objects) : 0
);

// Heights: heightmap / height offset for each tile
const USE_HEIGHT = false;
const heights = USE_HEIGHT ?
fill(null, WIDTH, HEIGHT, (i, j) => (i + j) * 0.16) :
fill(null, WIDTH, HEIGHT, () => 0);

const walls = fill(null, WIDTH + 1, HEIGHT * 2 + 1, (i, j) =>
    random() < 0.12 ? randInt(tileset.walls.length) : 0
);