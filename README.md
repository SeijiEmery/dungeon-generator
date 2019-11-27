# dungeon-generator

## Quickstart: to fetch + build + run this:

    git clone https://github.com/seijiemery/dungeon-generator
    cd dungeon-generator
    ./run.sh

## Dependencies:

    python 3.x
    pip3 install flask PyYAML Jinja2

## Overview:

- `/tools/extract_assets.py`: extracts, summarizes, and can preprocess (TBD) isometric kenney.nl asset packs stored in`/assets`. Notably, this generates asset info (as yaml files) in `/build/assets.yaml` and `/build/assets/<asset-pack>.yaml` for isometric oriented tiles (note: sprites for N, S, E, W directions), and sprite animations (TBD). These `.yaml` files can be used by...
- `/tools/rebuild_phaser_renderer.py`: assembles a phaser game from an html template with jinja2 markup (`/templates/phaser_template.html`), javascript files (TBD), and generated javascript (TBD); the latter of which should handle asset loading from data in `/build/assets.yaml`, etc. The output of this is `/build/example.html`.
- `flask_server.py`: runs a small flask server to serve `/build/example.html`, *and* all the assets extracted to `/build/assets/`. An upside is that flask will also detect file changes in any used `.py` files and will rebuild + relaunch the server. As a convenience `flask_server.py` also uses `webbrowser` to open the served URL corresponding to `build/example.html` in your web browser when it launches or reloads. Note that `/build/` is mapped to `<HOST-URL>/static/` by the flask web server.
- note that everything in `/build/` is explicitely *not* tracked by git + will be built from code, raw assets, and config files using python scripts in `/tools/`. Do NOT attempt to modify or commit anything in `/build/`, as everything in that directory is machine generated from other sources.
