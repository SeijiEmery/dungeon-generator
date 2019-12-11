import { ASSETS_BY_CATEGORY, DIRECTIONS } from '../generated/assets'
import { random, randInt, randIntRange, randomTile, randomDir, randomArrayPickOf } from '../core/random'
import { SparseArray2d } from '../core/array2d'
import config from '../generated/config'

const WIDTH = config.dungeon.width;
const HEIGHT = config.dungeon.height;
const ROTATIONS = [ 'N', 'E', 'S', 'W' ];
const tileset = ASSETS_BY_CATEGORY;

// Walls: denotes wall connections between any two tiles.
// The indexing here is a bit... complicated:
//  - this is a (W+1) * (H+1) map
//  - except it's actually a (W+1) * (H * 2 + 1), b/c we double up on / alternate rows
//    so that we can encode 4 connections between each tile
//  - indexes for each tile are as follows:
//      (i, j) <-> (i, j - 1), aka West  =>  i + 2 * j * (W + 1) 
//      (i, j) <-> (i - 1, j), aka North =>  i + (2 * j + 1) * (W + 1)
//      (i, j) <-> (i + 1, j), aka South =>  i + 1 + (2 * j + 1) * (W + 1)
//      (i, j) <-> (i, j + 1), aka East  =>  i + 2 * (j + 1) * (W + 1)
//
//                     (i-1,j)                          +z
//                        N                             ^
//                    /--/--/                           |
//        (i,j-1) W -/(i,j)/- E (i+1,j)                 *----> +y
//                  /--/--/                            /
//                    S                               /
//                (i+1,j)                           +x
//
// (and yes, these indices look weird; in truth the tileset is skewed significantly more around
//  the +z axis, and having the x + y axes set up as they are makes a bit more sense in that context
//  Also yes, the axes are set up this way so that +z is up, while still obeying the right hand rule...)
//
export function getWallEdges ({ floors }) {
    let walls = new Array2d(floors.width + 1, floors.height + 1);
    walls.fill((x, y) => {

    });
    return walls;
}
export function fillTiles({ tiles, tileset, pickTile, pickRotation }) {
    if (typeof(pickTile) !== 'function') pickTile = randomArrayPickOf(tileset);
    if (typeof(pickRotation) !== 'function') pickRotation = randomDir;
    return tiles.map((tile, x, y) =>
        tile > 0 ? pickTile(tile, x, y) + '_' + pickRotation(tile, x, y) : null);
}
export function generateWalls({ floors, tileset, pickWall }) {
    if (typeof(pickWall) !== 'function') pickWall = randomArrayPickOf(tileset);
    let { width, height } = floors;
    let walls = new SparseArray2d(width, height);
    for (let x = 0; x < width; ++x) {
        if (!!floors.get(x, 0))
            walls.values.push({ x, y: 0, tile: pickWall(x, 0) + '_E' });
        if (!!floors.get(x, height - 1))
            walls.values.push({ x, y: height-1, tile: pickWall(x, height-1) + '_W' });
    }
    for (let y = 0; y < height; ++y) {
        if (!!floors.get(0, y))
            walls.values.push({ x: 0, y, tile: pickWall(0, y) + '_S' });
        if (!!floors.get(width-1, y))
            walls.values.push({ x: width-1, y, tile: pickWall(width-1, y) + '_N' });
    }
    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            if (!!floors.get(x, y)) {
                if (!floors.get(x-1, y))
                    walls.values.push({ x, y, tile: pickWall(x, y) + '_S' });
                if (!floors.get(x+1, y))
                    walls.values.push({ x, y, tile: pickWall(x, y) + '_N' });
                if (!floors.get(x, y-1))
                    walls.values.push({ x, y, tile: pickWall(x, y) + '_E' });
                if (!floors.get(x, y+1))
                    walls.values.push({ x, y, tile: pickWall(x, y) + '_W' });
            }
        }
    }
    walls.sort();
    return walls;
}

export function getPixelMapping(mode) {
    switch (mode) {
        case 'isometric': 
        const CENTER_X = config.window.width / 2 - (-WIDTH + HEIGHT) * 128 / 2;
        const CENTER_Y = config.window.height / 2 - (592-256)/2 - (WIDTH + HEIGHT) * 64 / 2;
        return {
            toX: function (x, y, z) { return CENTER_X - x * 128 + y * 128 },
            toY: function (x, y, z) { return CENTER_Y + x * 64 + y * 64 + z * 64 },
        };
        case 'grid': return {
            toX: function (x, y, z) { return x * 128 },
            toY: function (x, y, z) { return y * 64 },
        };
    }
    return null;
}
export function buildRenderList({ tiles, heights, mode, order }) {
    let { toX, toY } = getPixelMapping(mode);
    const width = tiles.width;
    return heights ?
        tiles.flattenAndFilterNonNull((tile, x, y) =>
            tile && {
                x: toX(x, y, height.get(x, y)),
                y: toY(x, y, height.get(x, y)),
                order: order(tile, x, y),
                tile
            }) :
        tiles.flattenAndFilterNonNull((tile, x, y) =>
            tile && {
                x: toX(x, y, 0),
                y: toY(x, y, 0),
                order: order(tile, x, y),
                tile
            });
}

export function drawAll(game, items) {
    console.log(items);
    console.log(items.map);
    items = items.sort((a, b) => a.order >= b.order);
    console.log(items);
    return items.map(({ tile, x, y }) => {
        game.add.image(x, y, tile);
    })
}






