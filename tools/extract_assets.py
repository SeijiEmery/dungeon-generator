# -*- coding: utf-8 -*-
"""Asset processing + extraction

Generates all files in build/assets/ (and build/assets.yaml) from
archived / compressed kenney.nl source files in assets/.

Responsible for generating build/, and is the first thing that should
be run in the pipeline. Can be run as a standalone script, or can
call extract_all_assets.

Example:
    from extract_assets import extract_all_assets
    extract_all_assets()

"""

import os
import re
import yaml
from .utils import write_yaml, extract_zip

ASSETS_YAML_PATH = 'build/assets.yaml'
ASSETS_DIR = 'build/assets'


def extract_all_assets(dir='assets', target_dir=ASSETS_DIR):
    """ Finds, extracts, and processes all asset packs into target_dir.

    Each asset pack is a .zip file, and should be a zipped kenney.nl isometric
    asset pack.

    This function specifically finds all *sprites*, and extracts those sprites
    *and* writes a summary of all sprites found to .yaml files in target_dir.

    Args:
        dir (str): the directory (containing one or more .zip files) to scan
        target_dir (str): the directory to extract all files to

    Files written:
        <target_dir>/assets/<asset_pack>/<asset-files-and-subdirs...>
        <target_dir>/assets/<asset_pack>.yaml
            manifest of all files written in this asset pack, broken into
            sprites with N,S,E,W facings
        <target_dir>/assets.yaml
            manifest of all asset packs written (note: lists all asset packs,
            and includes the contents of all other .yaml files)

    TODO: we could process + combine sprite assets into sprite atlases, etc.,
    so we'd have fewer images to load. This would necessitate storing image
    coordinates + sizes. Very possible, but low priority as it would entail
    quite a bit of rework for very low benefit.
    """
    print(list(os.listdir('.')))
    asset_packs = {'asset_packs': {}}
    for file in os.listdir(dir):
        if file.endswith('.zip'):
            path = os.path.join(dir, file)
            target_path = extract_zip(path, target_dir=target_dir)
            name, assets = summarize_asset_pack(
                target_path, file.strip('.zip'))
            asset_packs['asset_packs'][name] = assets
    write_yaml(ASSETS_YAML_PATH, asset_packs)


def summarize_asset_pack(path, asset_pack_name, target_dir=ASSETS_DIR):
    """ Summarizes the contents of an asset pack after it has been extracted

    (searches for kenney.nl directional sprites, ie. .png files with names
    ending with _N, _S, _W, _E, and summarizes these into .yaml files)

    Args:
        path (str): path to an extracted asset pack directory
        asset_pack_name (str): original name of this pack / directory
                               (ie. <name>.zip)
        target_dir (str): root assets export dir (to write .yaml files to)

    Returns:
        (<asset-pack-name>, <dict-listing-all-sprite-assets-found>)
    """
    image_files = [
        os.path.join(root, file)
        for root, dirs, files in os.walk(path)
        for file in files
        if file.endswith('.png')
    ]
    iso_tiles = {}
    iso_tile_name_match = re.compile(r'([\w\W]*)_([NSEW]).png')

    for img in image_files:
        match = re.search(iso_tile_name_match, os.path.split(img)[1])
        if match is not None:
            name = match.group(1)
            direction = match.group(2)
            path = img
            if name not in iso_tiles:
                iso_tiles[name] = {'N': None, 'S': None, 'E': None, 'W': None}
            iso_tiles[name][direction] = path

    assets = {'tiles': iso_tiles}
    with open(os.path.join(target_dir, asset_pack_name + '.yaml'), 'w') as f:
        f.write(yaml.dump(assets))
    return asset_pack_name, assets


if __name__ == '__main__':
    os.chdir('..')
    extract_all_assets()
