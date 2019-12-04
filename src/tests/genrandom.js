import { runPhaser, start } from '../core/run_phaser'
import { ALL_ASSETS } from '../generated/assets'
import { randIntRange, randomTile } from '../core/random'

start(() => {
    const randomSprite = () => randomTile(ALL_ASSETS);
    runPhaser({
        update: function () {
            this.add.image(randIntRange(0, 800), randIntRange(0, 600), randomSprite());
        }
    });
});