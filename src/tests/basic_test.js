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
            //this.camera.zoom = 0.4;
            dungeon.width = 20;
            dungeon.height = 20;
            let tiles = basic_dungeon(dungeon);
            drawBasicGrid(this, {
                grid: tiles,
                spacing: 60,
                tileset: TILESET
            });           

            var clickButton = this.add.text(this.camera.x, this.camera.y, 'RESTART', { fill: '#0f0' })
              .setInteractive()
              .on('pointerdown', function() {
                document.location.reload();
                console.log(game.scene);
            });
            clickButton.setScrollFactor(0);
            console.log(clickButton.x, "fixedToCamera");        
        },
        
    })
})
