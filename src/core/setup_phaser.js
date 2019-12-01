import { loadAllAssets } from '../generated/assets';
import { runOnce, composeSequential } from './utils';


export function runPhaser (scene) {
    let initialized = false;
    let config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: loadAllAssets,
            update: composeSequential(runOnce(scene.init), scene.update),
            ...scene
        }
    };
    return new Phaser.Game(config);
}
export function start(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
