import os
import zipfile


def extract_zip(path, target_dir='build'):
    zip_name = os.path.split(path)[1].strip('.zip')
    target_path = os.path.join(target_dir, zip_name)
    if not os.path.exists(target_path):
        os.makedirs(target_path)
        with zipfile.ZipFile(path, 'r') as archive:
            for name in archive.namelist():
                if name.startswith(zip_name):
                    archive.extract(name, target_dir)


def extract_all_assets(dir='assets', target_dir='build'):
    for file in os.listdir(dir):
        if file.endswith('.zip'):
            extract_zip(os.path.join(dir, file), target_dir=target_dir)


if __name__ == '__main__':
    extract_all_assets()
