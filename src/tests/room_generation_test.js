import { start, runPhaser } from '../core/run_phaser'
import { drawBasicGrid } from '../core/basic_renderer'
import { graph_dungeon } from '../generators/room_generator'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { dungeon } from '../generated/config'
import { convert_path } from '../astar/astar_rewrite'
// const TILESET = ASSETS_BY_CATEGORY['objects'];
const TILESET = [ "barrel_E" ];
const PATHTILE = [ "chair_E" ];
const PATHKEY = [ "chair_N" ];
start(() => {
    const game = runPhaser({
        create: function() {
            // manually set dungeon size + camera zoom (override config...?)
            this.camera.zoom = 0.4;
            dungeon.width = 100;
            dungeon.height = 100;
            dungeon.numberOfRooms = 50;
            let output = graph_dungeon(dungeon);
            let tiles = output.dungeon;
            console.log(output,"OUTPUT");
            drawBasicGrid(this, {
                grid: tiles,
                spacing: 60,
                tileset: TILESET
            });

            let keyPath = convert_path(tiles, output.start, output.key,dungeon.width,dungeon.height);
            
            if(keyPath <= 0){
                let keyFail  = this.add.text(-200, this.camera.y, "CAN'T PATH TO KEY", {fontSize: 400, color:'#00ff00'});
                console.log("FAILURE TO GET KEY")
            }
            else{
                drawBasicGrid(this, {
                    grid: keyPath,
                    spacing: 60,
                    tileset: PATHKEY
                });

                ///////////////////////to end  
                let path = convert_path(tiles, output.key, output.end,dungeon.width,dungeon.height);
                if(path <= 0){
                    let endFail  = this.add.text(-200, this.camera.y, "CAN'T PATH TO END", {fontSize: 400, color:'#00ff00'});
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
        },
    })
})
