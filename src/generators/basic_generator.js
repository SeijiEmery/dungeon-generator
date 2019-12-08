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

    let rooms = [];
    let numRooms = 3;

    // Create the rooms
    for(let i = 0; i < numRooms; ++i){
        rooms[i] = {
            r_width: randIntRange(4,8),
            r_height: randIntRange(4,8),
            xcoord: 0,
            ycoord: 0,
        }

        let r = rooms[i];

        r.xcoord = randIntRange(1,width-r.r_width-1);
        r.ycoord = randIntRange(1,height-r.r_height-1);

        create_room(dungeon, r.xcoord, r.ycoord, r.r_width, r.r_height);
    }

    // Create the tunnels
    for(let i = 0; i < numRooms - 1; ++i){
        let xmidRoom1 = Math.floor(rooms[i].xcoord + rooms[i].r_width/2);
        let ymidRoom1 = Math.floor(rooms[i].ycoord + rooms[i].r_height/2);
        let xmidRoom2 = Math.floor(rooms[i+1].xcoord + rooms[i+1].r_width/2);
        let ymidRoom2 = Math.floor(rooms[i+1].ycoord + rooms[i+1].r_height/2);

        create_bend(dungeon, xmidRoom1, ymidRoom1, xmidRoom2, ymidRoom2);
    }

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