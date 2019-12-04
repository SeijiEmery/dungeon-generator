# -*- coding: utf-8 -*-
"""Utility functions used in tools/
"""

import zipfile
import yaml
from jinja2 import Template
import os


def extract_zip(path, target_dir):
    """ Extracts the contents of a .zip file from a zip file to a target dir.

    Args:
        path (str): path to a .zip file
        target_dir (str): the directory to extract all files to

    Returns:
        a path to the subdirectory that all files were extracted to
    """
    zip_name = os.path.split(path)[1].strip('.zip')
    target_path = os.path.join(target_dir, zip_name)
    if not os.path.exists(target_path):
        os.makedirs(target_path)
        with zipfile.ZipFile(path, 'r') as archive:
            # Note: a zip file can contain multiple directories, including
            # meta files. To ignore meta files, we only extract the dir w/ the
            # same name as the .zip file.
            # Note that we're following the following convention:
            #  - a directory named 'foo', and all its contents
            #    (eg. 'foo/bar.txt', 'foo/...') would be zipped as 'foo.zip'
            #  - foo.zip will have a directory 'foo' and all the contents
            #    have their original, local paths (ie. 'foo/bar.txt', 'foo/...)
            #    Note that this is generally enforced by the zip archive, so
            #    this part is not just a convention
            # -  this directory + all its contents would be extracted as foo/..
            # -  ergo, meta files (eg. __meta__/...), and anything that does
            #    not begin with 'foo/', can be safely ignored.
            for name in archive.namelist():
                if name.startswith(zip_name):
                    archive.extract(name, target_dir)
    return target_path


def cached_load(load_func):
    """ Decorator that can be used to wrap any expensive loading / processing
    function by caching / memoizing the result.

    This function must:
    - take at least one argument
    - the primary argument should be a string, and should uniquely identify
      this load request.
    """

    cache = {}

    def load(file, *args, **kwargs):
        if file in cache:
            return cache[file]
        data = load_func(file, *args, **kwargs)
        cache[file] = data
        return data
    return load


def write_yaml(file, obj):
    """ Writes a python object as a .yaml file to a directory.

    Args:
        file (str): path to a .yaml file
        obj: any python type (dict, list, str, int, float preferred)
    """
    save_file(file, yaml.dump(obj))


def load_yaml(path):
    """ Loads a yaml file as a python object """
    return yaml.load(load_file(path))


def load_file(path):
    """ Convenience function to load a text file + call <file>.read() """
    with open(path, 'r') as f:
        return f.read()


def save_file(path, data):
    """ Convenience function to save a text file + using <file>.write() """

    basedir = os.path.split(path)[0]
    if not os.path.exists(basedir):
        os.makedirs(basedir)

    with open(path, 'w') as f:
        f.write(data)


def save_jinja_template(template_html, output_html, *args, **kwargs):
    template = Template(load_file(template_html))
    save_file(output_html, template.render(*args, **kwargs))
    print("generated %s:" % output_html)
    # print(template.render(*args, **kwargs))


def deep_update(target, src):
    for k, v in src.items():
        if k in target and type(target[k]) == type(v) and type(v) == dict:
            deep_update(target[k], v)
        else:
            target[k] = v


def load_asset_pack(path):
    data = load_yaml(path)
    if 'asset_packs' in data:
        all_packs = {}
        print("Found %d asset pack(s): %s" % (
            len(data['asset_packs']),
            ', '.join(data['asset_packs'].keys())))
        for pack in data['asset_packs'].values():
            deep_update(all_packs, pack)
            print("update: %s" % ', '.join(all_packs['tiles'].keys()))
        data = all_packs
    return data


def get_tile_assets(path):
    ASSET_CONFIG_PATH = '../assets/asset_config.yaml'
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
                    ASSET_CONFIG_PATH, asset, category
                ))

    unused_assets = set(tiles.keys()) - used_assets
    print("Warning: %d / %d unused asset(s): %s" % (
        len(unused_assets),
        len(unused_assets) + len(used_assets),
        ", ".join(unused_assets)))
    return tiles, assets
