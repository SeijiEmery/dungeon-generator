import { loadAllAssets } from '../generated/assets';
import { composeSequential } from './utils'
import config from '../generated/config'

export const WINDOW_WIDTH = config.window.width;
export const WINDOW_HEIGHT = config.window.height;

export function runPhaser (scene) {
    let initialized = false;
    let config = {
        type: Phaser.AUTO,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        scene: {
            preload: composeSequential(loadAllAssets, scene.preload),
            init: composeSequential(function () {
                // set camera zoom from config
                this.camera = this.cameras.main;
                this.camera.zoom = (config && config.camera && config.camera.zoom) || 1.0;
            }, scene.init),
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
