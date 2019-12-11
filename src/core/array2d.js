
function forEach2 (width, height, fcn) {
    for (let i = 0; i < width; ++i) {
        for (let j = 0; j < height; ++j) {
            fcn(i, j);
        }
    }
}

export class Array2d {
    constructor (width, height) {
        this.width = width;
        this.height = height;
        this.values = new Array(width * height);
    }
    get (i, j) {
        return this.values[i + j * this.width];
    }
    set (i, j, value) {
        this.values[i + j * this.width] = value;
    }
    forEach (fcn) {
        forEach2(this.width, this.height, (i, j) => {
            fcn(this.values[i + j * this.width], i, j);
        });
    }
    fill (generator) {
        forEach2(this.width, this.height, (i, j) => {
            this.values[i + j * this.width] = generator(i, j);
        });
    }
    map (fcn) {
        let result = new Array2d(this.width, this.height);
        result.fill((i, j) => 
            fcn(this.values[i + j * this.width], i, j)
        );
        return result;
    }
    flattenAndFilterNonNull (fcn) {
        let output = new Array();
        this.forEach((value, i, j) => {
            let result = fcn(value, i, j);
            if (result) output.push(result); 
        });
        return output;
    }
}

export function fill2d(width, height, fcn) {
    let array = new Array2d(width, height);
    array.fill(fcn);
    return array;
}

export class SparseArray2d {
    constructor (width, height) {
        this.width = width;
        this.height = height;
        this.values = new Array();
    }
    forEach (fcn) {
        this.values.forEach(({ x, y, tile }) => fcn(tile, x, y));
    }
    sort() {
        this.values.sort(({ x, y }) => x + y * this.width);
    }
    fill (generator) {
        forEach2(this.width, this.height, (x, y) => {
            let tile = generator(x, y);
            if (tile) {
                this.values.push({ x, y, tile });
            }
        });
        this.sort();
    }
    map (fcn) {
        let output = new SparseArray2d(this.width, this.height);
        this.forEach((tile, x, y) => {
            tile = fcn(tile, x, y);
            if (tile) {
                output.values.push({ x, y, tile });
            }
        });
        return output;
    }
    flattenAndFilterNonNull (fcn) {
        let output = new Array();
        this.forEach((value, i, j) => {
            let result = fcn(value, i, j);
            if (result) output.push(result); 
        });
        return output;
    }
}
export function sparseFill2d(width, height, fcn) {
    let array = new SparseArray2d(width, height);
    array.fill(fcn);
    return array;
}

