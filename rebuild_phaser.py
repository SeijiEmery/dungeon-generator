from jinja2 import Template
import os


def load_file(path):
    with open(path, 'r') as f:
        return f.read()


def save_file(path, data):
    with open(path, 'w') as f:
        f.write(data)


def save_template(template_html, *args, **kwargs):
    template = Template(load_file(os.path.join('templates', template_html)))
    print(template.render())
    print(args)
    print(kwargs)
    save_file(os.path.join('build', template_html),
        template.render(*args, **kwargs))
    print(template.render(*args, **kwargs))


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

    save_template('example.html', **{
        k: v.strip() for k, v in args.items()
    })

if __name__ == '__main__':
    rebuild_phaser()
