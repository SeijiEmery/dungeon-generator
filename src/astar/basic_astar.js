
function init(grid) {
	var newGrid = [];
	for(var t = 0; t < grid.width;t++){
		newGrid[t] = [];
	}

	for(var x = 0; x < grid.width; x++) {
	  for(var y = 0; y < grid.height; y++) {

	  	newGrid[x][y] = {x: 0,
			y: 0,
			wall: 0,
			f: 0,
			h: 0,
			g: 0,
			parent: null,
		};
	  	newGrid[x][y].x = x;
	  	newGrid[x][y].y = y;
	  	newGrid[x][y].wall = grid.get(x,y);

	  }  
	}
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

	if(grid[x-1] && grid[x-1][y]) {
	  ret.push(grid[x-1][y]);
	}
	if(grid[x+1] && grid[x+1][y]) {
	  ret.push(grid[x+1][y]);
	}
	if(grid[x][y-1] && grid[x][y-1]) {
	  ret.push(grid[x][y-1]);
	}
	if(grid[x][y+1] && grid[x][y+1]) {
	  ret.push(grid[x][y+1]);
	}
	return ret;
}

export function search(grid, start, end) {
	var searchGrid = init(grid);
	var goodList = [];
	var closedList = [];
	var fail = [];
	var xPos = start.x;
	var yPos = start.y;
	fail.push(searchGrid[xPos][yPos]);
	var nice = 1;
	while(nice > 0) {
		nice--;
	  // Grab the lowest f(x) to process next
	  var lowInd = 0;
	  for(var i= 0; i<fail.length; i++) {
	    if(fail[i].f < fail[lowInd].f) { lowInd = i; }
	  }
	  var currentNode = fail[lowInd];
	  // End case -- result has been found, return the traced path
	  if(currentNode.x == end.x && currentNode.y == end.y) {
	    var curr = currentNode;
	    var ret = [];
	    while(curr.parent) {
	      ret.push(curr);
	      curr = curr.parent;
	    }
	    return ret.reverse();
	  }

	  // Normal case -- move currentNode from open to closed, process each of its neighbors

	  var m = 0;
	  for( m; m < fail.length; m++){
	  	if(fail[m]==currentNode){
	  		fail.splice(m,1);
	  		break;
	  	}
	  }

	  

	  closedList.push(currentNode);

	  var neighbors = getNeighbors(searchGrid, currentNode);
	  
	  for(var i= 0; i<neighbors.length;i++) {
	        var neighbor = neighbors[i];
	        for(var j = 0; j < closedList.length; j++){
	        	if(closedList[j] == neighbor ){ //|| neighbor==1
	        		continue;
	        	}
	        }
	       
	 		
	        // g score is the shortest distance from start to current node, we need to check if
	        //   the path we have arrived at this neighbor is the shortest one we have seen yet
	        var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
	        var gScoreIsBest = false;
	 
	 		
	 		
	        var firstVisted = true;
	        for(var q = 0; q < fail.length; j++){
	          
	          if(fail[q]==neighbor){
	          	firstVisted = false;
	          	break;
	          }         
	        }

	        // This the the first time we have arrived at this node, it must be the best
	        // Also, we need to take the h (heuristic) score since we haven't done so yet
	        if(firstVisted){
				gScoreIsBest = true;
	         	neighbor.h = heuristic(neighbor, end);
	         	fail.push(neighbor);
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
	   // No result was found -- empty array signifies failure to find path
		return fail;
		
}