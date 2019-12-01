import { runPhaser, start } from '../core/setup_phaser'
// import { ASSETS_BY_CATEGORY, DIRECTIONS } from '../generated/assets'

// const random = Math.random;
// const randInt = (n) => (random() * n) | 0;
// const randIntRange = (n, m) => n + randInt(m - n);
// const randomArrayPick = (array) => array[randInt(array.length)];
// const randomArrayPickOf = (array) => () => randomArrayPick(array);
// const randomDir = randomArrayPickOf(DIRECTIONS);
// const randomAsset = randomArrayPickOf(ASSETS_BY_CATEGORY.floors);
// const randomSprite = () => randomAsset() + '_' + randomDir();

// function runOnce (fcn) {
//     if (!fcn.initialized) {
//         fcn.initialized = true;
//         fcn.apply(this, arguments);
//     }
// }
// start(() => {
//     // const tiles  = new Array();
//     // const WIDTH  = 2;
//     // const HEIGHT = 2;
//     // let init = false;

//     // function toPixelSpace(x, y, z) {
//     //     return { 
//     //         x: 200 + x * 100,
//     //         y: 100 + y * 100,
//     //     };
//     // }
//     runPhaser({
//         update: function () {
//             // let { x, y } = toPixelSpace(0, 0, 0);
//             this.add.image(400, 300, "barrel_E");
//             // runOnce(()=>{
//             //     for (let i = 0; i < WIDTH; ++i) {
//             //         for (let j = 0; j < HEIGHT; ++i) {
//             //             let pos = toPixelSpace(i, j, 0);
//             //             tiles.push(this.add.image(pos.x|0, pos.y|0, "barrel_E"));
//             //                 // randomSprite()));
//             //         }
//             //     }
//             // });
//         }
//     });
// });

start(() => {
    runPhaser({
        init: function () {
            this.add.image(400, 300, "barrel_E");
        }
    });
});