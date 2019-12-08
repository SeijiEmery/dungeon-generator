import { Array2d } from '../core/array2d'
import { randInt } from '../core/random'
import { randIntRange } from '../core/random'


export function graph_dungeon (params) {
    const { width, height } = params;

    // TODO: implement this

    let rooms = [];
    let numRooms = 5;

    let dungeon = new Array2d(width,height);

    dungeon.fill((x,y) => {
        return 1;
    });

    // Multiply each coord by some multiplier
    // Populate partitions rooms
    let partitions = [];
    partition_rooms(partitions,0,0,width,height,numRooms);
    console.log(partitions);

    // Pick random locations for room
    for(let i = 0; i < numRooms; ++i){
        rooms[i] = {
            width: 1,
            height: 1,
            // This is in the top left, and could spawn in the bottom right
            x: 0,
            y: 0,
            edges: [],
            tunnels: [],
        };

        let r = rooms[i];
        let p = partitions[i];
        r.width = randIntRange(1,Math.abs(p.x1-p.x2)-1);
        r.height = randIntRange(1,Math.abs(p.y1-p.y2)-1);
        r.x = randIntRange(p.x1 + 1,p.x2 - width - 1);
        r.y = randIntRange(p.y1 + 1,p.y2 - height - 1);
    }

    // Create graph alg here
    for(let i = 0; i < numRooms; ++i){
        for(let j = i + 1; j < numRooms; ++j){
            if(partitions[i].x1 === partitions[j].x2 ||
               partitions[i].y1 === partitions[j].y2 ||
               partitions[i].y2 === partitions[j].y1 ||
               partitions[i].y2 === partitions[j].y1
               ){
                rooms[i].edges.push(j);
                rooms[j].edges.push(i);
            }
        }
    }
    // expand room alg here
    for(let i = 0; i < numRooms; ++i){
        let r = rooms[i];
        create_room(dungeon,r.x,r.y,r.width,r.height);
    }

    // Pick connections
    for(let i = 0; i < numRooms; ++i){
        let r = rooms[i];

        let totalEdges = r.edges.length;
        let numTunnels = randIntRange(1,totalEdges);
        let tempArr = r.edges.slice(0);

        console.log("temp = " + tempArr);

        for(let j = 0; j < totalEdges; ++j){
            let chosenEdge = randInt(tempArr.length);

            r.tunnels.push(tempArr[chosenEdge]);

            tempArr[chosenEdge] = tempArr[tempArr.length];

            tempArr.pop();
        }

        console.log("old edges = " + r.edges);
        console.log("new temp = " + tempArr);
        console.log("new tunnels = " + r.tunnels);
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

/*function partition_merge_recursive (numRooms, x1, y1, x2, y2, orientation){
    let partitions = [];

    if(numRooms === 1){
        let cell = {
            x1: ,
            y1: ,
            x2: ,
            y2: ,
        }
    }
}*/

function partition_rooms(array, X0,Y0,X,Y,ROOMS){
    if(ROOMS == 0){
        // Probably not possible
        return;
    }
    if(ROOMS == 1){
        let cell = {
            x1: X0,
            y1: Y0,
            x2: X,
            y2: Y,
        }
        array.push(cell);
        return;
    }
    var part1 = Math.floor(ROOMS/2);
    var part2 = ROOMS - part1;

    if(ROOMS % 2 == 0){
        var split = Math.floor(X/2);
        partition_rooms(array, X0,Y0,split,Y,part1);
        partition_rooms(array, split,Y0,X,Y,part2)
        return;
    }
    if(ROOMS % 2 == 1){
        var split = Math.floor(Y/2);
        partition_rooms(array, X0,Y0,X,split,part1);
        partition_rooms(array, X0,split,X,Y,part2);
        return;
    }
}
