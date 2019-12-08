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
from utils import save_jinja_template, get_tile_assets, save_file, load_yaml,\
    file_changed
from scan_js_deps import scan_js_deps
import json


ROOT_DIR = '.'
INDENT_4 = ' ' * 4
INDENT_8 = ' ' * 8


def needs_update(src_path, target_path):
    if not os.path.exists(target_path):
        return True
    if type(src_path) == list:
        paths = src_path
        for path in paths:
            if needs_update(path, target_path):
                return True
        return False
    return not os.path.exists(src_path) or file_changed(src_path)


def generate_assets_js():
    SRC_PATHS = [
        '../assets/asset_config.yaml',
    ] + [
        os.path.join('../assets', file)
        for file in os.listdir('../assets')
        if file.endswith('.zip')
    ]
    TARGET_PATH = '../src/generated/assets.js'
    if needs_update(SRC_PATHS, TARGET_PATH):
        print("skipping rebuild of %s" % TARGET_PATH)

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
    print("rebuilt %s" % TARGET_PATH)
    save_file(TARGET_PATH, lines)
    # print(lines)


def generate_config_js():
    SRC_FILE = '../config/config.yaml'
    TARGET_FILE = '../src/generated/config.json'
    if needs_update(SRC_FILE, TARGET_FILE):
        config = load_yaml(SRC_FILE)
        save_file(TARGET_FILE, json.dumps(config))
    else:
        print("skipping generation of %s" % TARGET_FILE)


def generate_webpack_builds(changed_files=None, entry_dir='../src/tests', force_rebuild=False):
    if not needs_update('../src/', '../build/'):
        print("no js files changed; skipping rebuild")
        return

    entrypoints = [
        os.path.join(entry_dir, file)
        for file in os.listdir(entry_dir)
        if file.endswith('.js')
    ]
    if changed_files and not force_rebuild:
        all_js_deps = scan_js_deps()
        def get_entrypoints_to_rebuild(entrypoints):
            for entrypoint in entrypoints:
                for dep in all_js_deps[entrypoint]:
                    if dep in changed_files:
                        yield entrypoint
                        break

        entrypoints = list(get_entrypoints_to_rebuild(entrypoints))
        if len(entrypoints) == 0:
            print("no files to rebuild!")
            return
        print("rebuilding '%s'" % ', '.join(entrypoints))

    for file in os.listdir(entry_dir):
        if not file.endswith('.js'):
            continue
        filename = file.strip('.js')
        entry_path = os.path.join(entry_dir, file)
        config_path = os.path.join(
            '../build/webpack_configs/', filename + '.config.js')
        output_path = os.path.join('../build', filename + '.html')

        webpack_build_config = '''module.exports = {{
            entry: '{entry_path}',
            mode: 'development',
            output: {{ filename: '{filename}.js', path: '{builddir}' }}
        }}'''.format(entry_path=os.path.abspath(entry_path)
                                       .replace('\\', '\\\\'),
                     filename=filename,
                     builddir=os.path.abspath('../build')
                                     .replace('\\', '\\\\'))

        save_file(config_path, webpack_build_config)

        # print("webpack-cli --config {} --display=minimal".format(config_path))
        res = subprocess.run(
            "webpack-cli --config {} --display=minimal".format(config_path),
            shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        # print(res)
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
    generate_webpack_builds([ '../src/tests/barrel.js' ], force_rebuild=True)


if __name__ == '__main__':
    # os.chdir('..')
    rebuild_phaser()
