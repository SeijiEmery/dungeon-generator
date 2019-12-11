import { start, runPhaser } from '../core/run_phaser'
import { drawBasicGrid } from '../core/basic_renderer'
import { basic_dungeon } from '../generators/basic_generator'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { dungeon } from '../generated/config'
import { convert_path } from '../astar/astar_rewrite'
import { Array2d } from '../core/array2d'
// const TILESET = ASSETS_BY_CATEGORY['objects'];
const TILESET = [ "barrel_E" ];
const PATHTILE = [ "chair_E" ];
const PATHKEY = [ "chair_N" ];
start(() => {
    const game = runPhaser({
        
        create: function() {
            // manually set dungeon size + camera zoom (override config...?)
            //this.camera.zoom = 0.4;
            dungeon.width = 20;
            dungeon.height = 20;
            let tiles = basic_dungeon(dungeon);
            console.log(tiles);
            drawBasicGrid(this, {
                grid: tiles.dungeon,
                spacing: 60,
                tileset: TILESET
            });
            ///////////////////////to key
                            //grid, start, end,  dungeonGridWidth, dungeonGrid Height
            let keyPath = convert_path(tiles.dungeon, tiles.start, tiles.key,dungeon.width,dungeon.height);
            if(keyPath <= 0){
                console.log("FAILURE TO GET KEY")
            }
            else{
                drawBasicGrid(this, {
                    grid: keyPath,
                    spacing: 60,
                    tileset: PATHKEY
                });

                ///////////////////////to end
                let path = convert_path(tiles.dungeon, tiles.key, tiles.end,dungeon.width,dungeon.height);
                if(path <= 0){
                    console.log("FAILURE TO GO TO END")
                }
                else{
                    drawBasicGrid(this, {
                        grid: path,
                        spacing: 60,
                        tileset: PATHTILE
                    });
                }
            }   


        }
    })
})
