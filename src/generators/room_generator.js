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

function create_bend (array, xroom1, yroom1, xroom2, yroom2){
    let xtunnel;
    let ytunnel;
    if(randInt(1) == 0){
        xtunnel = Math.floor(xroom1);
        ytunnel = Math.floor(yroom2);
    }
    else{
        xtunnel = Math.floor(xroom2);
        ytunnel = Math.floor(yroom1);
    }

    create_tunnel(array, xtunnel, ytunnel, xroom1, yroom1);
    create_tunnel(array, xtunnel, ytunnel, xroom2, yroom2);
}

function create_room (array, xOrigin, yOrigin,width,height) {
    //console.log("room: (" + xOrigin + ", " + yOrigin + ") , (" + width + ", " + height + ")");
    for(let i = xOrigin; i < xOrigin + width; ++i){
        for(let j = yOrigin; j < yOrigin + height; ++j){
            array.set(i,j,0);
        }
    }
}

// r = room
function create_tunnel (array, xOrigin, yOrigin, xroom, yroom){
    //console.log("tunnel: (" + xOrigin + ", " + yOrigin + ") , (" + xroom + ", " + yroom + ")");

    let xtunnel = Math.min(xOrigin,xroom);
    let ytunnel = Math.min(yOrigin,yroom);

    let xwidth;
    let yheight;
    if(xOrigin != xroom){
        xwidth = Math.abs(xOrigin - xroom + 1);
        yheight = 1;
    }
    else{
        xwidth = 1;
        yheight = Math.abs(yOrigin - yroom + 1);
    }
    
    create_room(array,xtunnel,ytunnel,xwidth,yheight);
}

function partition_rooms(X0,Y0,X,Y,ROOMS){
    var partitions = [];
    if(ROOMS == 0){
        // Probably not possible
        return partitions;
    }
    if(ROOMS == 1){
        partitions.push([X0,Y0,X,Y]);
        return partitions;
    }
    var part1 = Math.floor(ROOMS/2);
    var part2 = ROOMS - part1; 
    if(ROOMS % 2 == 0){
        var split = Math.floor(X/2);
        partitions.push(partition_rooms(X0,Y0,split,Y,part1));
        partitions.push(partition_rooms(split,Y0,X,Y,part2));
        return(partitions);
    }
    if(ROOMS % 2 == 1){
        var split = Math.floor(Y/2);
        partitions.push(partition_rooms(X0,Y0,X,split,part1));
        partitions.push(partition_rooms(X,split,X,Y,part2));
        return(partitions);
    }
}