import { runPhaser, start } from '../core/run_phaser'
import config from '../generated/config'
import { makeRenderer } from '../core/renderer'
import { dungeon } from '../generated/config'
import { graph_dungeon } from '../generators/room_generator'

start(() => {
    var render;
    var camera;

    const game = runPhaser({
        create: function () {
            // Set camera zoom
            camera = this.cameras.main;
            camera.zoom = 0.4;

            dungeon.width = config.dungeon.width;
            dungeon.height = config.dungeon.height;
            dungeon.numberOfRooms = config.dungeon.rooms;
            let output = graph_dungeon(dungeon);
            let tiles = output.dungeon;

            // Draw everything once at startup
            // (but could re-draw in update and regen continuously...)
            const render = makeRenderer(this, tiles);
            render();
        },
    });
});
