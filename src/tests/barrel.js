import { runPhaser, start } from '../core/run_phaser'

start(() => {
    runPhaser({
        create: function () {
            this.add.image(400, 300, "barrel_E");
        }
    });
});