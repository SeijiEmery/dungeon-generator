import { Array2d } from '../core/array2d'
import { randInt } from '../core/random'
import { randIntRange } from '../core/random'


export function basic_dungeon (params) {
    const { width, height } = params;

    // TODO: implement this

    let dungeon = new Array2d(width,height);

    dungeon.fill((x,y) => {
        return 1;
    });

    create_room(dungeon,10,10,7,5);

    create_room(dungeon,13,20,5,8);

    create_room(dungeon, 15, 15, 1, 7);

    return dungeon;
}

function create_room (array, xOrigin, yOrigin,width,height) {
    /*array.fill((x,y) => {
        if(xOrigin <= x && x < xOrigin + width && yOrigin <= y && y < yOrigin + height){
            return 0;
        }
        return 1;
    });*/
    for(let i = xOrigin; i < xOrigin + width; ++i){
        for(let j = yOrigin; j < yOrigin + height; ++j){
            array.set(i,j,0);
        }
    }
}