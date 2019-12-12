import { runPhaser, start } from '../core/run_phaser'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { random, randInt, randIntRange, randomTile } from '../core/random'
import { graph_dungeon } from '../generators/room_generator'
import {
    fillTiles,
    generateWalls,
    buildRenderList,
    drawAll
} from '../core/renderer'
import { fill2d } from '../core/array2d'
import config from '../generated/config'

start(() => {
    const tiles  = new Array();
    const tileset = ASSETS_BY_CATEGORY;
    let floors = graph_dungeon(config.dungeon).dungeon.map((tile) => tile ? 0 : 1);
    let objects = floors.map(
        (tile, x, y) => !!tile && random() < 0.2 ? 1 : 0);

    floors = fillTiles({ tiles: floors, tileset: tileset.floors });
    objects = fillTiles({ tiles: objects, tileset: tileset.objects });
    let walls = generateWalls({ floors, tileset: tileset.walls });
    let wallOrdering = {
        N: +.2,
        S: -.1,
        E: -.2,
        W: +.1,
    }
    const mode = 'isometric';
    const renderables = buildRenderList({ tiles: floors, mode, order: (t, x, y) => x + y - 100 })
        //.concat(buildRenderList({ tiles: objects, mode, order: (t, x, y) => x + y }))
        .concat(buildRenderList({ tiles: walls, mode, order: (t, x, y) => x + y + wallOrdering[t[t.length-1]] }))
    ;

    var renderedItems;
    var camera;
    const game = runPhaser({
        create: function () {
            renderedItems = drawAll(this, renderables);

            // Set camera zoom
            camera = this.cameras.main;
            camera.zoom = 0.4;
        },
    });
});
