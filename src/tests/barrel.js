import { runPhaser } from '../core/setup_phaser'

runPhaser({
    update: () => {
        this.add.image(400, 300, "barrel_E");
    }
});
