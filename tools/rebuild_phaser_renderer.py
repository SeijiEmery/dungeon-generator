from jinja2 import Template
import os

ROOT_DIR = '.'
TEMPLATES_DIR = os.path.join(ROOT_DIR, 'templates')
BUILD_DIR = os.path.join(ROOT_DIR, 'build')


def load_file(path):
    with open(path, 'r') as f:
        return f.read()


def save_file(path, data):
    with open(path, 'w') as f:
        f.write(data)


def save_template(template_html, output_html, *args, **kwargs):
    src_path = os.path.join(ROOT_DIR, template_html)
    dst_path = os.path.join(ROOT_DIR, output_html)
    template = Template(load_file(src_path))
    save_file(dst_path, template.render(*args, **kwargs))
    # print(template.render(*args, **kwargs))


def rebuild_phaser():
    args = {
        'TITLE': 'example',
        'INIT': '',
    }
    args['PRELOAD'] = """
        this.load.image('barrel', 'assets/assets_kenny_dungeon_pack/Isometric/barrel_E.png');
    """
    args['CREATE'] = """
        this.add.image(400,300,'barrel');
    """
    args['UPDATE'] = """

    """

    save_template('templates/phaser_template.html', 'build/example.html', **{
        k: v.strip() for k, v in args.items()
    })


if __name__ == '__main__':
    rebuild_phaser()
