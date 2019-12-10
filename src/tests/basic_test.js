import { start, runPhaser } from '../core/run_phaser'
import { drawBasicGrid } from '../core/basic_renderer'
import { basic_dungeon } from '../generators/basic_generator'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { dungeon } from '../generated/config'
import { search } from '../astar/astar_rewrite'
import { Array2d } from '../core/array2d'
// const TILESET = ASSETS_BY_CATEGORY['objects'];
const TILESET = [ "barrel_E" ];
const PATHTILE = [ "chair_E" ];
start(() => {
    const game = runPhaser({
        create: function() {
            // manually set dungeon size + camera zoom (override config...?)
            this.camera.zoom = 0.4;
            dungeon.width = 20;
            dungeon.height = 20;
            let tiles = basic_dungeon(dungeon);
            console.log(tiles);
            drawBasicGrid(this, {
                grid: tiles.dungeon,
                spacing: 60,
                tileset: TILESET
            });
            
            let pathfinder = search(tiles.dungeon, tiles.start, tiles.end);
            console.log(pathfinder, "pathfinder");

            let path = new Array2d(dungeon.width,dungeon.height);
            path.fill((x,y) => {
                return 0;
            });
            for(var i = 0; i < pathfinder.length; i++){
                path.set(pathfinder[i].x,pathfinder[i].y,1);
                console.log(path.get(pathfinder[i].x,pathfinder[i].y), "path.get");
            }

            console.log(path);
            drawBasicGrid(this, {
                grid: path,
                spacing: 60,
                tileset: PATHTILE
            });

        }
    })
})
