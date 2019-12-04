import { DIRECTIONS } from '../generated/assets'

export const random = new Math.seedrandom(null);
export const randInt = (n) => (random() * n) | 0;
export const randIntRange = (n, m) => n + randInt(m - n);
export const randomArrayPick = (array) => array[randInt(array.length)];
export const randomArrayPickOf = (array) => () => randomArrayPick(array);
export const randomDir = randomArrayPickOf(DIRECTIONS);
export const randomTile = (tileset) =>
    randomArrayPick(tileset) + '_' + randomDir();
