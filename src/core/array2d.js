
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
        result.fill((i, j) => this.values[i + j * this.width]);
        return result;
    }
}
