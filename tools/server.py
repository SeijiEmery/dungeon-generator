import vfs
# from simple_server import simple_http_server
from services import main, start_services
from utils import merge_dicts
import os


@main
def run(*args, **kwargs):
    # server = simple_http_server(root='../build', url='localhost:5000')
    vfs_ = vfs.create(workdir='.', cache='../build/vfs', actions=[
        vfs.each('../assets/*.zip', extract_assets)
           .accumulate(summarize_assets)
           .then(generate_assets_js),
        vfs.each('../config/*.yaml', generate_config),
        vfs.scan_js_deps('../src/', ext='.js'),
        vfs.each('../src/tests/*.js',
                 vfs.with_all_js_imports(
                     generate_html_and_js_for_entrypoint,
                     srcdir='../src', ext='.js')
                 .then(server.open_in_web_browser))
    ])
    start_services(vfs=vfs_).run(*args, **kwargs)
    # start_services(vfs=vfs_, server=server).run(*args, **kwargs)


def extract_assets(zip_path):
    name = os.path.split(zip_path)[1].strip('.zip')
    extract_dir = os.path.join('../build/assets', name)
    yaml_path = os.path.join('../build/assets', name + '.yaml')
    yield vfs.extract_zip(src=zip_path, target=extract_dir)
    assets = scan_assets_pack(extract_dir)
    yield vfs.save_yaml(yaml_path, assets)


def summarize_assets(asset_packs):
    assets = merge_dicts(asset_packs)
    yield vfs.save_yaml('../build/assets.yaml', assets)


def generate_assets_js(assets):
    def generate():
        pass
    yield vfs.save_file('../src/generated/assets.js', generate())


def generate_config(path):
    pass


def generate_html_and_js_for_entrypoint(src_path, js_imports):
    pass


if __name__ == '__main__':
    main.start()
