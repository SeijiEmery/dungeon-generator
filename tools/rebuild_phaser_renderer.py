# -*- coding: utf-8 -*-
"""Generates the phaser map generator client + renderer

eg. build/example.html

Can be run as a standalone script, or (typically) is called from flask_server

Expects extract_assets to have been run first.

Example:
    from rebuild_phaser_renderer import rebuild_phaser
    rebuild_phaser()
"""
import os
# from .utils import save_jinja_template, get_tile_assets, save_file
from utils import save_jinja_template, get_tile_assets, save_file

ROOT_DIR = '.'
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
        save_jinja_template(self.src_template, os.path.join(
            'build', self.name + '.html'), **args)


def generate_assets_js():
    tiles, asset_list = get_tile_assets('build/assets.yaml')
    paths = {
        name: {
            direction: '/'.join(path.split('/')[1:])
            for direction, path in parts.items()
        }
        for name, parts in tiles.items()
    }
    def generate():
        yield 'export const ASSETS_BY_CATEGORY = {\n%s};' % (''.join([
            "%s%s: [ %s ],\n" % (INDENT_4, category, ', '.join([
                '"%s"' % asset for asset in assets.keys()
            ]))
            for category, assets in asset_list.items()
        ]))

        def flatten (xs):
            for ys in xs:
                for y in ys:
                    yield y

        yield 'export const ALL_ASSETS = [ %s ];' % ', '.join([
            '"%s"' % asset
            for asset in set(flatten([
                assets.keys() for assets in asset_list.values()
            ]))
        ])
        yield 'export const DIRECTIONS = [ "N", "S", "E", "W" ];'
        yield 'export function loadAllAssets () {\n%s}' % ''.join([
            '%sthis.load.image("%s_%s", "%s");\n' % (
                INDENT_4, name, direction, paths[name][direction])
            for category in asset_list.keys()
            for name in asset_list[category].keys()
            for direction in ('N', 'S', 'E', 'W')
        ])

    lines = '\n'.join(generate())
    save_file('src/generated/assets.js', lines)
    # print(lines)


def rebuild_phaser():
    generate_assets_js()
    return

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
