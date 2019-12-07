import { Array2d } from '../core/array2d'
import { randInt } from '../core/random'
import { randIntRange } from '../core/random'


export function graph_dungeon (params) {
    const { width, height } = params;

    // TODO: implement this

    /*let array = new Array2d(width, height);
    array.fill((i, j) => {
        return randInt(2);
    });*/

    let rooms = [];
    let numRooms = 5;

    let dungeon = new Array2d(width,height);

    dungeon.fill((x,y) => {
        return 1;
    });

    // Multiply each coord by some multiplier
    // Populate partitions rooms
    let partitions = [];
    let numPartY = 3;
    let numPartX = 3;
    for(let i = 0; i < numPartX; ++i){
        for(let j = 0; j < numPartY; ++j){
            partitions[i + j * numPartX] = {
                x1: i,
                y1: j,
                x2: i+1,
                y2: j+1,
            }
        }
    }

    // Merge certain rooms
    /*while(partitions.size() != numRooms){
        let curr_part_node = randInt(partitions.size());
    }*/
    // Pick random locations for room
    // replace with partitions
    for(let i = 0; i < numRooms; ++i){
        rooms[i] = {
            width: randInt(10),
            height: randInt(10),
            // This is in the top left, and could spawn in the bottom right
            x: 0,
            y: 0,
            edges: [],
        };

        let r = rooms[i];
        r.x = randIntRange(partitions[i].x1 + 1,partitions[i].x2 - width - 1);
        r.y = randIntRange(partitions[i].y1 + 1,partitions[i].y2 - height - 1);
    }

    // Create graph alg here

    // expand room alg here
    // determine dimensions
    // maybe overlap rooms?

    // Pick connections
    for(let i = 0; i < numRooms; ++i){
        
    }

    // Dig tunnels

    // Pick end and start rooms

    return dungeon;
}
