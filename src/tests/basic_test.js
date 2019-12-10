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
            console.log("hoopla");
            this.camera.zoom = 0.4;
            dungeon.width = 20;
            dungeon.height = 20;
            let tiles = basic_dungeon(dungeon);
            drawBasicGrid(this, {
                grid: tiles,
                spacing: 60,
                tileset: TILESET
            });           


            const clickButton = this.add.text(100, 100, 'Click me!', { fill: '#0f0' })
              .setInteractive()
              .on('pointerdown', function() {
                document.location.reload();
                console.log(game.scene);
            });

              /*
            let restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            restartKey.on('down', )*/
        },
    })
})
