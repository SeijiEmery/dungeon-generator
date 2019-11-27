from .extract_assets import extract_all_assets
from .rebuild_phaser_renderer import rebuild_phaser


def rebuild():
    extract_all_assets()
    rebuild_phaser()


if __name__ == '__main__':
    import os
    os.chdir('..')
    rebuild()
