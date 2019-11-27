from jinja2 import Template
import yaml
import os

ROOT_DIR = '.'


def cached_load(func):
    cache = {}

    def load(file):
        if file in cache:
            return cache[file]
        data = func(file)
        cache[file] = data
        return data
    return load


@cached_load
def load_file(path):
    with open(os.path.join(ROOT_DIR, path), 'r') as f:
        return f.read()


def save_file(path, data):
    with open(os.path.join(ROOT_DIR, path), 'w') as f:
        f.write(data)


def save_template(template_html, output_html, *args, **kwargs):
    template = Template(load_file(template_html))
    save_file(output_html, template.render(*args, **kwargs))
    print(template.render(*args, **kwargs))


@cached_load
def load_yaml(path):
    return yaml.load(load_file(path))


@cached_load
def load_asset_pack(path):
    data = load_yaml(path)
    if 'asset_packs' in data:
        all_packs = {}
        for pack in data['asset_packs'].values():
            all_packs.update(pack)
        data = all_packs
    return data


@cached_load
def get_tile_assets(path):
    ASSET_CONFIG_PATH = 'config/asset_config.yaml'
    asset_config = load_yaml(ASSET_CONFIG_PATH)['assets']
    tiles = load_asset_pack(path)['tiles']
    # print(asset_config)
    # print(tiles.keys())

    used_assets = set()
    assets = {key: {} for key in asset_config.keys()}
    for category, asset_list in asset_config.items():
        for asset in asset_list:
            if asset in tiles:
                assets[category][asset] = tiles[asset]
                used_assets.add(asset)
            else:
                print("ERROR %s: invalid asset '%s' in category '%s'" % (
                    ASSET_CONFIG_PATH, category, asset
                ))

    unused_assets = set(tiles.keys()) - used_assets
    print("Warning: %d / %d unused asset(s): %s" % (
        len(unused_assets),
        len(unused_assets) + len(used_assets),
        ", ".join(unused_assets)))
    return tiles, assets


INDENT_4 = ' ' * 4
INDENT_8 = ' ' * 8


class PhaserCodeGenerator:
    def __init__(self, src_template, name):
        self.src_template = src_template
        self.name = name
        self.args = {k: list()
                     for k in ('INIT', 'PRELOAD', 'CREATE', 'UPDATE')}

    def init(self, fcn):
        self.args['INIT'].append(fcn())

    def preload(self, fcn):
        self.args['PRELOAD'].append(fcn())

    def create(self, fcn):
        self.args['CREATE'].append(fcn())

    def update(self, fcn):
        self.args['UPDATE'].append(fcn())

    def generate(self):
        args = {k: '\n'.join(v).strip() for k, v in self.args.items()}
        args['TITLE'] = self.name
        save_template(self.src_template, os.path.join(
            'build', self.name + '.html'), **args)


def rebuild_phaser():
    generator = PhaserCodeGenerator(
        'templates/phaser_template.html', 'example')

    tiles, asset_list = get_tile_assets('build/assets.yaml')
    paths = {
        name: {
            direction: '/'.join(path.split('/')[1:])
            for direction, path in parts.items()
        }
        for name, parts in tiles.items()
    }

    # Add a list of all assets, by category, for use on the js side

    @generator.init
    def add_asset_defns():
        return '%svar assets = {\n%s%s};' % (INDENT_4, ''.join([
            '%s%s: [ %s ],\n' % (INDENT_8, category, ', '.join([
                '"%s"' % asset for asset in assets.keys()
            ]))
            for category, assets in asset_list.items()
        ]), INDENT_4)

    # load all selected assets (filtered by config/asset_config.yaml)

    @generator.preload
    def load_assets():
        return ''.join([
            '%sthis.load.image("%s_%s", "%s");\n' % (
                INDENT_8, name, direction, paths[name][direction])
            for category in asset_list.keys()
            for name in asset_list[category].keys()
            for direction in ('N', 'S', 'E', 'W')
        ])

    # testing: add a barrel

    @generator.create
    def show_barrel():
        return '%sthis.add.image(400, 300, "barrel_E");' % INDENT_8

    # testing: add a randomly chosen sprite every update

    @generator.init
    def update_add_random_constants():
        return """
            var random = Math.random;
            var ASSET_CATEGORIES = [ {categories} ];
            var ASSET_DIRECTIONS = [ 'N', 'S', 'E', 'W' ];
            function randint (n) {{
                return (random() * n)|0;
            }}
            function randomArrayPick (array) {{
                return array[randint(array.length)];
            }}
            function randomArrayPickOf (array) {{
                return function () {{ return randomArrayPick(array); }};
            }}
            var randomCategory = randomArrayPickOf(ASSET_CATEGORIES);
            var randomAsset = function () {{
                return randomArrayPick(assets[randomCategory()]);
            }};
            var randomDir = randomArrayPickOf(ASSET_DIRECTIONS);
            var randomSprite = function () {{
                return randomAsset()+'_'+randomDir();
            }};
        """.format(
            categories=', '.join(['"%s"' % k for k in asset_list.keys()]),
            count=len(asset_list.keys()),
        )

    @generator.update
    def update_add_random():
        return """
            this.add.image((random()*800)|0, (random()*600)|0, randomSprite());
        """.strip().format(asset_count=len(asset_list))

    generator.generate()


if __name__ == '__main__':
    os.chdir('..')
    rebuild_phaser()
