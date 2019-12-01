import { loadAllAssets } from '../generated/assets';

export function runPhaser (scene) {
    let initialized = false;
    let config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: loadAllAssets,
            update: function () {
                if (!initialized && typeof(scene.init) === 'function') {
                    initialized = true;
                    scene.init.apply(this, arguments);
                }
                if (typeof(scene.update) === 'function') {
                    scene.update.apply(this, arguments);
                }
            },
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
