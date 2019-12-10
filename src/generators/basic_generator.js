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
            width: randIntRange(4,8),
            height: randIntRange(4,8),
            x: 0,
            y: 0,
        }

        let r = rooms[i];

        r.x = randIntRange(1,width-r.width-1);
        r.y = randIntRange(1,height-r.height-1);

        create_room(dungeon, r.x, r.y, r.width, r.height);
    }

    // Create the tunnels
    for(let i = 0; i < numRooms - 1; ++i){
        let xmidRoom1 = Math.floor(rooms[i].x + rooms[i].width/2);
        let ymidRoom1 = Math.floor(rooms[i].y + rooms[i].height/2);
        let xmidRoom2 = Math.floor(rooms[i+1].x + rooms[i+1].width/2);
        let ymidRoom2 = Math.floor(rooms[i+1].y + rooms[i+1].height/2);

        create_bend(dungeon, xmidRoom1, ymidRoom1, xmidRoom2, ymidRoom2);
    }

    let start = {
        x: 0,
        y: 0,
    }

    let end = {
        x: 0,
        y: 0,
    }
    let key = {
        x: 0,
        y: 0,
    }

    start.x = rooms[0].x + randInt(rooms[0].width);
    start.y = rooms[0].y + randInt(rooms[0].height);

    key.x = rooms[1].x + randInt(rooms[1].width);
    key.y = rooms[1].y + randInt(rooms[1].height);

    end.x = rooms[numRooms-1].x + randInt(rooms[numRooms-1].width);
    end.y = rooms[numRooms-1].y + randInt(rooms[numRooms-1].height);

    return {
        dungeon: dungeon,
        start: start,
        end: end,
        key: key,
    };
   // return dungeon;
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