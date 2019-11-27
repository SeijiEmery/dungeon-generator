# dungeon-generator

## Quickstart: to fetch + build + run this:

    git clone https://github.com/seijiemery/dungeon-generator
    cd dungeon-generator
    ./run.sh

## Dependencies:

    python 3.x
    pip3 install flask PyYAML Jinja2

## Overview:

- `tools/extract_assets.py`: extracts, summarizes, and can preprocess (TBD) isometric kenney.nl asset packs stored in`assets/`. Notably, this generates asset info (as yaml files) in `build/assets.yaml` and `build/assets/<asset-pack>.yaml` for isometric oriented tiles (note: sprites for N, S, E, W directions), and sprite animations (TBD). These `.yaml` files can be used by...
- `tools/rebuild_phaser_renderer.py`: assembles a phaser game from an html template with jinja2 markup (`templates/phaser_template.html`), javascript files (TBD), and generated javascript (TBD); the latter of which should handle asset loading from data in `build/assets.yaml`, etc. The output of this is `build/example.html`.
- `flask_server.py`: runs a small flask server to serve `build/example.html`, *and* all the assets extracted to `build/assets/`. An upside is that flask will also detect file changes in any used `.py` files and will rebuild + relaunch the server. As a convenience `flask_server.py` also uses `webbrowser` to open the served URL corresponding to `build/example.html` in your web browser when it launches or reloads. Note that `build/` is mapped to `http://<HOST-URL>/static/` by the flask web server. Note that `HOST-URL` is just `localhost:5000` until / if we deploy this somewhere (and then this would become a config / env variable).
- note that everything in `build/` is explicitely *not* tracked by git + will be built from code, raw assets, and config files using python scripts in `tools/`. Do NOT attempt to modify or commit anything in `build/`, as everything in that directory is machine generated from other sources.

## Tooling (please install these!)

- http://sublimetext.com
- https://packagecontrol.io/packages/Anaconda

To install anaconda within sublime:

- press shift+ctrl/cmd+p => type "install" => press enter on "Package Control: install package".
- type "anaconda", select, and press enter to install the anaconda python plugin.

## Code formatting, etc:

Python code must be:

- space delimited, at 4 spaces / indent
- follow PEP8: https://www.python.org/dev/peps/pep-0008/

Note that with the anaconda package, invalid code formatting will be shown in sublime using white boxes. You can fix most formatting errors by typing <shift+ctrl/cmd+p> => "autof" => press enter on "Anaconda: Autoformat PEP8 Errors". This will also show the keybinding for this command, if you want to use that instead.

## TODO: (map generation, in no particular order)

- write the js framework for map generation
- write the map renderer backend (also js)
- provide a system to hook in js files, hopefully w/ babel so you can use es6 / es2019
- add code generation to load in selected assets from the `.yaml` summary files (note: you should be able to specify this from a .yaml config file, NOT write these paths manually in js!!!!) <- we have way too many assets + would be a total waste of your time when we can do this via code instead.
- add a digital ocean instance (or just use heroku) so we can deploy this. (note: we don't need to do this until the end of the project, but this is what we'd do for deployment + demoing)
- add an index page (static or dynamic; we do have this running on flask after all) so you can browse between different generators
- add all the other TODO items that need to go on this list... >_<

## How map generation + rendering is supposed to work:

### Renderer:

- output is pretty: nice isometric assets with 4 facings (north / south / east / west)
- renderer should be able to scroll around w/ mouse and/or arrow keys
- we have floors (tiles), walls (sits between tiles), and doodads / objects (sits on top of tiles)
- tiles have x,y positions, rotations (4 directions), and z (height!)
- generator does NOT know / care about rendering details!!!

### Room generator:

- outputs a few things:
    - a 2d grid of room ids (0 = empty; 1, 2, 3, ... correspond to different rooms)
    - a 2d grid of height values
    - a 2d grid of door connections...? (binary; two tiles adjacent => door placement iff there's a wall)
    - a 2d grid of object placements...? (binary)
- we could come up with other approaches but this is an initial idea
- some data is derived!
    - walls exist where two different rooms / room ids are adjacent
    - may have other rules
    - objects exist only where there is a clear room / floor tile AND the object map is set
- so, basically each generator just generates a 2d array (or just a flat array) of integer indices
- would make it pretty hard to do manual placement, but very easy to generate stuff

### Floor + wall placement:

- governed by another generator
    - random w/ rules
    - texture synthesis...?
    - other approaches...?
- we can keep things simple for this, but if we have time we could experiment more with this

### Asset config files:

- sprite tiles discovered automatically (conveniently, Kenney.nl isometric tile assets all end with `_W`, `_S`, etc)
- we consider all sprites w/ the same name (outside of this extension) to be one sprite, but with different facings
- config file will consist of something like:
    - `walls: [<list-of-wall-sprites>]`
    - `floors: [<list-of-floor-sprites>]`
    - etc.
    - additionally, we may have some kind of tagging system, to eg. differentiate between a wall end piece and a wall center piece, etc.
- we should start simple, with very few assets
- but, theoretically, we should be able to scale very easily
- from the js side, you would just have:
    - any used assets would be preloaded for you, maybe have some kind of convention for naming N/S/E/W sprites
    - all walls would be in a `walls` array, floors in a `floors`, array, etc.

### Generator API + file structure

TBD


