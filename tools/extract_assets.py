import os
import re
import zipfile
import yaml

ASSETS_YAML_PATH = 'build/assets.yaml'
ASSETS_DIR = 'build/assets'


def extract_zip(path, target_dir=ASSETS_DIR):
    zip_name = os.path.split(path)[1].strip('.zip')
    target_path = os.path.join(target_dir, zip_name)
    if not os.path.exists(target_path):
        os.makedirs(target_path)
        with zipfile.ZipFile(path, 'r') as archive:
            for name in archive.namelist():
                if name.startswith(zip_name):
                    archive.extract(name, target_dir)
    return target_path


def write_yaml(file, obj):
    with open(file, 'w') as f:
        f.write(yaml.dump(obj))


def extract_all_assets(dir='assets', target_dir=ASSETS_DIR):
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
    extract_all_assets()
