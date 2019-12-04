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
import subprocess
from utils import save_jinja_template, get_tile_assets, save_file, load_yaml
import json

ROOT_DIR = '.'
INDENT_4 = ' ' * 4
INDENT_8 = ' ' * 8


def generate_assets_js():
    tiles, asset_list = get_tile_assets('../build/assets.yaml')
    paths = {
        name: {
            direction: path.replace('\\', '/')
                           .replace('../build/assets', './assets')
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

        def flatten(xs):
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
    print("rebuilt ../src/generated/assets.js")
    save_file('../src/generated/assets.js', lines)
    # print(lines)


def generate_config_js():
    config = load_yaml('../config/config.yaml')
    save_file('../src/generated/config.json', json.dumps(config))


def generate_webpack_builds(entry_dir='../src/tests'):
    for file in os.listdir(entry_dir):
        if not file.endswith('.js'):
            continue
        filename = file.strip('.js')
        entry_path = os.path.join(entry_dir, file)
        config_path = os.path.join(
            '../build/webpack_configs/', filename + '.config.js')
        output_path = os.path.join('../build', filename + '.html')
        save_file(config_path, '''module.exports = {{
            entry: '{entry_path}',
            mode: 'development',
            output: {{ filename: '{filename}.js', path: '{builddir}' }}
        }}'''.format(entry_path=os.path.abspath(entry_path)
                                       .replace('\\', '\\\\'),
                     filename=filename,
                     builddir=os.path.abspath('../build')
                                     .replace('\\', '\\\\')))

        res = subprocess.run(
            "webpack-cli --config {} --display=minimal".format(config_path),
            shell=True, capture_output=True)
        if res.returncode == 0:
            save_jinja_template('../templates/phaser_template.html',
                                output_path,
                                TITLE=filename,
                                MAIN_JS=file)
        else:
            error_msg = res.stdout.decode("utf-8") + res.stderr.decode("utf-8")
            print("\nError while generating '../build/%s.html':\n%s\n" %
                  (filename, error_msg))
            save_jinja_template('../templates/error.html',
                                output_path,
                                TITLE=filename,
                                ERROR=error_msg.replace('\n', '<p>'))


def rebuild_phaser():
    generate_assets_js()
    generate_config_js()
    generate_webpack_builds()


if __name__ == '__main__':
    # os.chdir('..')
    rebuild_phaser()
