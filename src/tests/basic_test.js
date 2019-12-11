import { start, runPhaser } from '../core/run_phaser'
import { drawBasicGrid } from '../core/basic_renderer'
import { basic_dungeon } from '../generators/basic_generator'
import { ASSETS_BY_CATEGORY } from '../generated/assets'
import { dungeon } from '../generated/config'

// const TILESET = ASSETS_BY_CATEGORY['objects'];
const TILESET = [ "barrel_E" ];
start(() => {
    const game = runPhaser({
        create: function() {
            // manually set dungeon size + camera zoom (override config...?)
            this.camera.zoom = 0.4;
            dungeon.width = 20;
            dungeon.height = 20;
            let output = basic_dungeon(dungeon);
            let tiles = output.dungeon;
            drawBasicGrid(this, {
                grid: tiles,
                spacing: 60,
                tileset: TILESET
            });
        }
    })
})
