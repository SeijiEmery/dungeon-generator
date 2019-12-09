import { loadAllAssets } from '../generated/assets';
import { composeSequential } from './utils'
import config from '../generated/config'

export const WINDOW_WIDTH = config.window.width;
export const WINDOW_HEIGHT = config.window.height;
const SPEED = config.camera.speed;
const CAM_ORIGIN = config.camera.origin;
const CAM_WIDTH = config.camera.width;
export function runPhaser (scene) {
    let initialized = false;
    let controls;
    let config = {
        type: Phaser.AUTO,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        scene: {
            preload: composeSequential(loadAllAssets, scene.preload),
            init: composeSequential(function () {
                // set camera zoom from config
                this.camera = this.cameras.main;
                this.camera.setBounds(CAM_ORIGIN, CAM_ORIGIN,CAM_WIDTH,CAM_WIDTH); // (xpos,ypos,width,height),
                this.camera.zoom = (config && config.camera && config.camera.zoom) || 1.0;
                let cursors = this.input.keyboard.createCursorKeys();
                let controlConfig = {
                    camera: this.camera,
                    left: cursors.left,
                    right: cursors.right,
                    up: cursors.up,
                    down: cursors.down,
                    zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                    zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
                    speed: SPEED,
                }
                controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
            }, scene.init),
            update: composeSequential(function (time, delta) {
                controls.update(delta);
            }, scene.update),
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
