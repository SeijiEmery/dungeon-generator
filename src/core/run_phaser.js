import { loadAllAssets } from '../generated/assets';
import { composeSequential } from './utils'

export function runPhaser (scene) {
    let initialized = false;
    let config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: composeSequential(loadAllAssets, scene.preload),
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
