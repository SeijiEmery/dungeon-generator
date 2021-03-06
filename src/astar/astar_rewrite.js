import { Array2d } from '../core/array2d'

function init(grid) {
	var newGrid = new Array2d(grid.width, grid.height);
	for(var i = 0; i < newGrid.width; i++){
		for(var j = 0; j < newGrid.height; j++){
			newGrid.set(i,j, {
				x: i,
				y: j,
				wall: grid.get(i,j), 
				g: 0,
				h: 0,
				f: 0,
				parent: null,
			})
		}
	}
	console.log(grid,"init");
	console.log(newGrid, "init");
	return newGrid;
	
}


function heuristic(pos0, pos1) {
	// This is the Manhattan distance
	var d1 = Math.abs (pos1.x - pos0.x);
	var d2 = Math.abs (pos1.y - pos0.y);
	return d1 + d2;
}
function getNeighbors(grid, node) {
	var ret = [];
	var x = node.x;
	var y = node.y;

	//left
	if(grid.get(x-1,y)) {
	  ret.push(grid.get(x-1,y));
	}
	//right
	if(grid.get(x+1,y)) {
	  ret.push(grid.get(x+1,y));
	}
	//up
	if(grid.get(x,y-1)) {
	  ret.push(grid.get(x,y-1));
	}
	//down
	if(grid.get(x,y+1)) {
	  ret.push(grid.get(x,y+1));
	}
	return ret;
}

export function search(grid, start, end) {
		var searchGrid = init(grid);
		console.log(searchGrid, "IN search")
		var openList = [];
		var closedList = [];
		openList.push(searchGrid.get(start.x,start.y));
		//console.log(openList,openList.length, "Start Push");
		var test_length = 20;
		var pushCount = 0;
		while(openList.length > 0){ //change with openList.length > 0
			test_length--;

			// Grab the lowest f(x) to process next
			var lowInd = 0;
			for (var i = 0; i < openList.length; i++) {
				if(openList[i].f < openList[lowInd].f) { lowInd = i}
			}

			var currentNode = openList[lowInd];

			// End case -- result has been found, return the traced path
			if(currentNode.x == end.x && currentNode.y == end.y){
				var curr = currentNode;
				var ret = [];
				while(curr.parent){
					ret.push(curr);
					curr = curr.parent;
				}
				return ret.reverse();
			}
			// Normal case -- move currentNode from open to closed, process each of its neighbors
			var m = 0;
			for( m; m < openList.length; m++){
				if(openList[m]==currentNode){
					//console.log(currentNode);
					openList.splice(m,1);
					break;
				}
			}



			closedList.push(currentNode);
			//console.log(closedList,closedList.length, "Add to closedList");

			var neighbors = getNeighbors(searchGrid, currentNode);
			//console.log(neighbors,"All neighbor");
			
			for (var i = 0; i < neighbors.length; i++) {
				var neighbor = neighbors[i];
				var found = false;
				for (var j = 0; j < closedList.length; j++) {					
					if(closedList[j] == neighbor){
						found = true; 
					}
				}
				if (found || neighbor.wall ==1){
						continue;
				}

				// g score is the shortest distance from start to current node, we need to check if
		        //   the path we have arrived at this neighbor is the shortest one we have seen yet
		        var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
		        var gScoreIsBest = false;

		        var firstVisted = true;
		        for (var k = 0; k < openList.length; k++) {
		        	if(openList[k]==neighbor){
		        		firstVisted = false;
		        		break;
		        	}
		        }

			    // This the the first time we have arrived at this node, it must be the best
		        // Also, we need to take the h (heuristic) score since we haven't done so yet
		        if(firstVisted){
					gScoreIsBest = true;
		         	neighbor.h = heuristic(neighbor, end);
		         	//console.log(neighbor, "heuristic");
		         	openList.push(neighbor);
		         	pushCount++;
		         	//console.log(openList.length, "Added to openList");
	        	}
	        	   	
		        else if(gScore < neighbor.g) {
		          // We have already seen the node, but last time it had a worse g (distance from start)
		          gScoreIsBest = true;
		        }
		 		
		        if(gScoreIsBest) {
		          // Found an optimal (so far) path to this node.   Store info on how we got here and
		          //  just how good it really is...
		          neighbor.parent = currentNode;
		          neighbor.g = gScore;
		          neighbor.f = neighbor.g + neighbor.h;
		        }
			}
		}
		return [];
}

export function convert_path(grid, start, end, width, height){
	var findPath = grid;
	//console.log(grid,"grid in convert_path");
	//console.log(findPath,"findPath in convert_path");
	var path = search(findPath,start,end);
	path.pop();
	console.log(path, path.length,"Shorter Path in convert_path");
    var newPath = new Array2d(width,height);
        newPath.fill((x,y) => {
            return 0;
        });
    for(var i = 0; i < path.length; i++){
        newPath.set(path[i].x,path[i].y,1);
       	console.log(newPath.get(path[i].x,path[i].y), "path.get");
	}
	return newPath;
}