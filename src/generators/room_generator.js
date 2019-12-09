import { Array2d } from '../core/array2d'
import { randInt } from '../core/random'
import { randIntRange } from '../core/random'


export function graph_dungeon (params) {
    const { width, height } = params;

    // TODO: implement this

    let rooms = [];
    let numRooms = 15;

    let dungeon = new Array2d(width,height);

    dungeon.fill((x,y) => {
        return 1;
    });

    // Multiply each coord by some multiplier
    // Populate partitions rooms
    let partitions = [];
    partition_rooms(partitions,0,0,width - 1,height - 1,numRooms);

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
        // temp solution to control whether we want max size or not
        if(false){
            r.width = Math.abs(p.x1-p.x2)-1;
            r.height = Math.abs(p.y1-p.y2)-1;
            r.x = p.x1 + 1;
            r.y = p.y1 + 1;
        }
        else{
            r.width = randIntRange(1,Math.abs(p.x1-p.x2)-1);
            r.height = randIntRange(1,Math.abs(p.y1-p.y2)-1);
            r.x = randIntRange(p.x1 + 1,p.x2 - r.width - 1);
            r.y = randIntRange(p.y1 + 1,p.y2 - r.height - 1);
        }
        
        //console.log("room " + i + ": " + r.width + " " + r.height + ", " + r.x + " " + r.y);
        console.log("room " + i);
        console.log(r);
    }

    // Create graph alg here
    for(let i = 0; i < numRooms; ++i){
        for(let j = i + 1; j < numRooms; ++j){
            let thisP = partitions[i];
            let thatP = partitions[j];
            if(partition_adj_check(thisP.x1,thatP.x2,thisP.y1,thisP.y2,thatP.y1,thatP.y2) ||
               partition_adj_check(thisP.y1,thatP.y2,thisP.x1,thisP.x2,thatP.x1,thatP.x2) ||
               partition_adj_check(thisP.x2,thatP.x1,thisP.y1,thisP.y2,thatP.y1,thatP.y2) ||
               partition_adj_check(thisP.y2,thatP.y1,thisP.x1,thisP.x2,thatP.x1,thatP.x2)
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

        let tempArr = r.edges.slice(0);

        // Only consider new tunnels
        // Trim current tunnels out of possible candidates
        for(let i = 0; i < r.tunnels.length; ++i){
            for(let j = 0; j < tempArr.length; ++j){
                if(r.tunnels[i] === tempArr[j]){
                    delete_arr_elem(tempArr,j);
                }
            }
        }

        let totalEdges = Math.max(1, tempArr.length - 1);
        let numTunnels = randIntRange(0,totalEdges);

        // Pick new tunnels
        for(let j = 0; j < numTunnels; ++j){
            let chosenIndex = randInt(tempArr.length-1);
            let chosenValue = tempArr[chosenIndex];

            r.tunnels.push(chosenValue);
            rooms[chosenValue].tunnels.push(i);

            delete_arr_elem(tempArr,chosenIndex);
        }
    }

    // Check for completion
    while(true){
        // Run dfs
        // each index of dfs_result corresponds to rooms
        let dfs_result = dfs(rooms);

        // Log which rooms were unvisited in dfs
        let incomplete = [];
        for(let i = 0; i < numRooms; ++i){
            if(dfs_result[i] === false){
                incomplete.push(i);
            }
        }

        // If all rooms are visited, then exit
        if(incomplete.length === 0){
            break;
        }
        // else, carve a new tunnel and try again
        carve_new_tunnel(incomplete, rooms, dfs_result);
    }

    // Dig tunnels
    for(let i = 0; i < numRooms; ++i){
        let t = rooms[i].tunnels;
        for(let j = 0; j < t.length; ++j){
            // any index t[j] is less than i has already been dug
            if(i < t[j]){
                let xmidRoom1 = Math.floor(rooms[i].x + rooms[i].width/2);
                let ymidRoom1 = Math.floor(rooms[i].y + rooms[i].height/2);
                let xmidRoom2 = Math.floor(rooms[t[j]].x + rooms[t[j]].width/2);
                let ymidRoom2 = Math.floor(rooms[t[j]].y + rooms[t[j]].height/2);
                create_bend(dungeon, xmidRoom1, ymidRoom1, xmidRoom2, ymidRoom2);
            }
        }
    }

    // Pick end and start rooms

    for(let i = 0; i < numRooms; ++i){
        console.log("end room " + i);
        console.log(rooms[i]);
    }

    return dungeon;
}

function carve_new_tunnel(incomplete, rooms, dfs_result) {
    let chosenIndex = randInt(incomplete.length - 1); // index of incomplete
    let chosenRoom = incomplete[chosenIndex]; // index of rooms

    let r = rooms[chosenRoom];
    let e = r.edges;
    // We iterate through the edges of an unvisited room
    for(let i = 0; i < e.length; ++i){
        // to find another room that has been visited
        let otherRoom = e[i];
        if(dfs_result[otherRoom] === true){
            // if it has, then we push in our tunnels that connection
            r.tunnels.push(e[i]);
            rooms[otherRoom].tunnels.push(chosenRoom);
            return;
        }
    }

    // Iterate through all rooms that are disconnected
    /*for(let i = 0; i < incomplete.length; ++i){
        // Iterate through a room's edges
        // incomplete[i] returns a rooms index
        let r = rooms[incomplete[i]];
        let e = r.edges;
        // e[j] returns a room's index
        for(let j = 0; j < e.length; ++j){
            // If this is unvisited and j is visited...
            if(dfs_result[e[j]] === true){
                r.tunnels.push(e[j]);
                rooms[j].tunnels.push(incomplete[i]);
                return;
            }
        }
    }*/
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
        xwidth = Math.abs(xOrigin - xroom);
        yheight = 1;
    }
    else{
        xwidth = 1;
        yheight = Math.abs(yOrigin - yroom + 1);
    }
    
    create_room(array,xtunnel,ytunnel,xwidth,yheight);
}

function delete_arr_elem(array,position){
    array[position] = array[array.length - 1];
    array.pop();
}

function dfs(rooms){
    let visited = [];
    for(let i = 0; i < rooms.length; ++i)
        visited[i] = false;
    dfs_recursive(rooms, visited, 0);

    return visited;
}

function dfs_recursive(rooms, visited, position){
    visited[position] = true;
    let t = rooms[position].tunnels;
    for(let i = 0; i < t.length; ++i){
        if(visited[t[i]] === false){
            dfs_recursive(rooms, visited, t[i]);
        }
    }
}

function partition_adj_check(thisx1,thatx2,thisy1,thisy2,thaty1,thaty2){
    if(thisx1 === thatx2){
        return (thisy1 <= thaty2 && thisy2 >= thaty1);
    }
    return false;
}

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
        var split = divide_partition(X0,X,part1,part2)
        partition_rooms(array, X0,Y0,split,Y,part1);
        partition_rooms(array, split,Y0,X,Y,part2)
        return;
    }
    if(ROOMS % 2 == 1){
        var split = divide_partition(Y0,Y,part1,part2);
        partition_rooms(array, X0,Y0,X,split,part1);
        partition_rooms(array, X0,split,X,Y,part2);
        return;
    }
}

function divide_partition (low,high,rooms1,rooms2){
    var lower_bound = low + (5 * rooms1);
    var upper_bound = high - (5 * rooms2);
    if(lower_bound > upper_bound){
        //throw an error
    }
    return randIntRange(lower_bound,upper_bound);
}