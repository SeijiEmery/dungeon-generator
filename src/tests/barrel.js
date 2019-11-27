import { runPhaser, start } from '../core/setup_phaser'

start(() => {
    runPhaser({
        update: function () {
            this.add.image(400, 300, "barrel_E");
        }
    });
});