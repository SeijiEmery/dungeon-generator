import { loadAllAssets } from '../generated/assets';

export function runPhaser (scene) {
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: loadAllAssets,
            ...scene
        }
    };
    return new Phaser.Game(config);
}
