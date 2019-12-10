import { start, runPhaser } from '../core/run_phaser'
import { drawBasicGrid } from '../core/basic_renderer'
import { graph_dungeon } from '../generators/room_generator'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { dungeon } from '../generated/config'

// const TILESET = ASSETS_BY_CATEGORY['objects'];
const TILESET = [ "barrel_E" ];
start(() => {
    const game = runPhaser({
        create: function() {
            // manually set dungeon size + camera zoom (override config...?)
            this.camera.zoom = 0.4;
            dungeon.width = 100;
            dungeon.height = 100;
            let tiles = graph_dungeon(dungeon);
            drawBasicGrid(this, {
                grid: tiles,
                spacing: 60,
                tileset: TILESET
            });
        }
    })
})
