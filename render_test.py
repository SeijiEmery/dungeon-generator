import pygame
import yaml
import sys

ASSETS_YAML_PATH = 'build/assets.yaml'
ASSETS_DIR = 'build/assets'


def load_yaml(path):
    with open(path, 'r') as f:
        return yaml.load(f)


FACINGS = ['E', 'N', 'W', 'S']


class Sprite:
    def __init__(self, facings):
        self.facings = [
            pygame.image.load(facings[direction])
            for direction in FACINGS
        ]

    def draw(self, screen, pos, direction):
        sprite = self.facings[direction]
        rect = sprite.get_rect()
        rect = rect.move(pos)
        print(rect)
        print(screen)
        screen.blit(sprite, rect)


def load_asset_pack(path):
    tiles = {}

    def load_tiles(pack):
        for name, data in pack['tiles'].items():
            tiles[name] = Sprite(data)
            print("%s: %s" % (name, tiles[name].facings))

    data = load_yaml(path)
    if 'asset_packs' in data:
        for pack in data['asset_packs'].values():
            load_tiles(pack)
    else:
        load_tiles(pack)
    return tiles


initializers = []


def run_at_init(f):
    global initializers
    initializers.append(f)


def run():
    for init in initializers:
        init()


run_client = None


ESC = 27


def keydown(event, key):
    return event.type == pygame.KEYDOWN and event.key == key


def frame_update(frame_update_func):
    def run(size=None):
        size = size or (800, 600)
        pygame.init()
        screen = pygame.display.set_mode(size)
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT or keydown(event, ESC):
                    # print(event)
                    sys.exit()
            screen.fill((1, 1, 0))
            frame_update_func(screen=screen)
            pygame.display.update()
            pygame.display.flip()
    run_at_init(run)


tiles = load_asset_pack(ASSETS_YAML_PATH)
print(tiles.keys())


@frame_update
def update(screen):
    tiles['barrel'].draw(screen, (400, 300), 0)


if __name__ == '__main__':
    run()
