import { runPhaser, start } from '../core/setup_phaser'
import { ASSETS_BY_CATEGORY, DIRECTIONS } from '../generated/assets'

const random = Math.random;
const randInt = (n) => (random() * n) | 0;
const randIntRange = (n, m) => n + randInt(m - n);
const randomArrayPick = (array) => array[randInt(array.length)];
const randomArrayPickOf = (array) => () => randomArrayPick(array);
const randomDir = randomArrayPickOf(DIRECTIONS);
const randomTile = (assets) =>
    randomArrayPick(assets) + '_' + randomDir();

start(() => {
    const tiles  = new Array();
    const WIDTH  = 50;
    const HEIGHT = 50;

    const CENTER_X = 0;
    const CENTER_Y = 0;

    // (x, y, z) world coords => screen coords
    //
    //          +z
    //          ^
    //          |
    //          * ---> +y
    //         / /-----/-----/-----/
    //        / /(0,0)/(0,1)/(0,2)/
    //      +x /-----/-----/-----/
    //        /(1,0)/(1,1)/(1,2)/
    //       /-----/-----/-----/
    //      /(2,0)/(2,1)/(2,2)/
    //     /-----/-----/-----/
    //
    function toPixelSpace(x, y, z) {
        return { 
            x: CENTER_X - x * 128 + y * 128,
            y: CENTER_Y + x * 64  + y * 64    + z * 64,
        };
    }
    const ROTATIONS = [ 'N', 'E', 'S', 'W' ];
    function tileRenderer (game, w, h, tileset) {
        const w2 = w / 2, h2 = h / 2;
        const drawTile = (x, y, tile, tileset) => {
            // tile encodes tileset index (tile / 4 - 1)
            //  and rotation index (tile % 4)
            //
            // used for floors + objects / doodads, although for walls
            // the rotation index is set explicitely
            //  (as such, walls are just sprite indices)
            //
            // but in both cases:
            //  0 / undefined                       => empty / no tile
            //  tile index on (0, tileset.length]   => tile
            // 
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

            // note: walls are drawn offset as walls should sit slightly above the floor tiles
            // TODO: 
            //  - stone tiles are ~20px up
            //  - dirt tiles are ~10px up
            // causes a discrepancy (either clip through stone tiles OR float above dirt, which is what
            // I'm currently doing). Not a bit deal, but we could maybe fix this by adding a tile floor
            // offset or something to asset_config...?

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

        }
    }
    function forEach2 (w, h, fcn) {
        for (let i = 0; i < w; ++i) {
            for (let j = 0; j < h; ++j) {
                fcn(i, j);
            }
        }
    }
    // fill all elements of an array using gen(x, y)
    // called for all x, y indices on [0, w) x [0, h)
    //
    // If elems is null, a new array will be created.
    // This function expands elems to include at least w * h elements.
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
    function randomTile (tileset, rotations) {
        return randInt(tileset.length * rotations) + rotations;
    }
    // tileset (note: defined by config/asset_config.yaml)
    const tileset = ASSETS_BY_CATEGORY;

    //
    // temp (ie. totally random) map generation
    //
    // Consists of several W * H arrays of tile indices
    //  (note: these generally encode tile AND rotation indices, as above)
    //

    // Floors: base tile sprites
    // - this is a W * H map
    // - each tile value is an integer encoding a tile index + a rotation index:
    //      v = t * 4 + r
    //      where t on [0, tilemap.floors.length)
    //            r on [0, 4)
    //          and ROTATIONS[r] => actual rotation
    //
    // Furthermore, tile indexing is as follows:
    //   (i, j) => i + j * W
    // 
    const floors = fill(null, WIDTH, HEIGHT, () =>
        random() < 1 ? randomTile(tileset.floors, 4) : 0
    );

    // Objects: objects / doodads that can be drawn on top of the sprites
    const objects = fill(null, WIDTH, HEIGHT, () =>
        random() < 0.3 ? randomTile(tileset.objects, 4) : 0
    );

    // Heights: heightmap / height offset for each tile
    const USE_HEIGHT = false;
    const heights = USE_HEIGHT ?
        fill(null, WIDTH, HEIGHT, (i, j) => (i + j) * 0.16) :
        fill(null, WIDTH, HEIGHT, () => 0);


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
    const walls = fill(null, WIDTH + 1, HEIGHT * 2 + 1, (i, j) =>
        random() < 0.12 ? randInt(tileset.walls.length) : 0
    );
    
    
    let makeRenderer = (game) => {
        const render = tileRenderer(game, WIDTH, HEIGHT, tileset);
        return () => {
            forEach2(WIDTH, HEIGHT, (i, j) => {
                render(i, j, floors, walls, objects, heights)
            });
        };
    };

    var render;
    var camera;
    const game = runPhaser({
        create: function () {
            // Draw everything once at startup
            // (but could re-draw in update and regen continuously...)
            render = makeRenderer(this);
            render();

            // Set camera zoom
            camera = this.cameras.main;
            camera.zoom = 0.4;
        },
    });
});
