import config from '../generated/config';

const WINDOW_WIDTH = config.window.width;
const WINDOW_HEIGHT = config.window.height;

export function drawBasicGrid(game, params) {
    console.log(params);
    let { grid, tileset, spacing, center } = params;
    let center_x = center ? center.x : 1;
    let center_y = center ? center.y : 0;
    let spacing_x = 40;
    let spacing_y = 40;
    if (typeof(spacing) === 'object') {
        spacing_x = spacing.x;
        spacing_y = spacing.y;
    } else if (typeof(spacing) === 'number') {
        spacing_x = spacing_y = spacing;
    }
    let total_width = grid.width * spacing_x;
    let total_height = grid.height * spacing_y;
    let offset_x = total_width / 2 + center_x - WINDOW_WIDTH / 2;
    let offset_y = total_height / 2 + center_y - WINDOW_HEIGHT / 2 + 168;

    console.log(`${offset_x} ${total_width} ${grid.width} ${spacing_x}`)

    grid.forEach((tile, x, y) => {
        console.log(`generating '${tile}' at ${x}, ${y}`);
        if (tile && tileset[tile-1]) {
            drawTile(game,
                tileset[tile-1], 
                x * spacing_x - offset_x,
                y * spacing_y - offset_y);
        }
    });
}

export function drawTile(game, tile, x, y) {
    console.log(`drawing '${tile}' at ${x}, ${y}`);
    game.add.image(x, y, tile);
}

