import { runPhaser } from '../core/setup_phaser'
import { ALL_ASSETS, DIRECTIONS } from '../generated/assets'

const random = Math.random;
const randInt = (n) => (random() * n) | 0;
const randIntRange = (n, m) => n + randInt(m - n);
const randomArrayPick = (array) => array[randInt(array.length)];
const randomArrayPickOf = (array) => () => randomArrayPick(array);
// const randomCategory = randomArrayPickOf(ASSET_CATEGORIES);
const randomDir = randomArrayPickOf(DIRECTIONS);
const randomAsset = randomArrayPickOf(ALL_ASSETS);
// const randomAsset = () => randomArrayPick(assets[randomCategory()]);
const randomSprite = () => randomAsset() + '_' + randomDir();

runPhaser({
    update: () => {
        this.add.image(randIntRange(0, 800), randIntRange(0, 600), randomSprite());
    }
});
