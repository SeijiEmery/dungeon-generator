import { Array2d } from '../core/array2d'
import { randInt } from '../core/random'


export function generate (params) {
    const { width, height } = params;

    // TODO: implement this

    let array = new Array2d(width, height);
    array.fill((i, j) => {
        return randInt(2);
    });
    return array;
}
