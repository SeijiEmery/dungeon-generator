# dungeon-generator

## Quickstart: to fetch + build + run this:

    git clone https://github.com/seijiemery/dungeon-generator
    cd dungeon-generator
    ./run.sh isometric_render_test

## Dependencies:

    npm
    python 3.8.x
    npm install -g webpack-cli
    pip3 install watchdog PyYAML Jinja2
    
## WINDOWS INSTALL INSTRUCTIONS

- Install WSL: https://docs.microsoft.com/en-us/windows/wsl/install-win10
- open bash + run: 

```bash
    sudo apt install python3.8 python3-pip npm
    pip3 install watchdog PyYAML Jinja2
    npm install -g webpack-cli
    git clone https://github.com/seijiemery/dungeon-generator
    cd dungeon-generator
    ./run.sh isometric_render_test
```

## Overview:

- `tools/extract_assets.py`: extracts, summarizes, and can preprocess (TBD) isometric kenney.nl asset packs stored in`assets/`. Notably, this generates asset info (as yaml files) in `build/assets.yaml` and `build/assets/<asset-pack>.yaml` for isometric oriented tiles (note: sprites for N, S, E, W directions), and sprite animations (TBD). These `.yaml` files can be used by...
- `tools/rebuild_phaser_renderer.py`: assembles a phaser game from an html template with jinja2 markup (`templates/phaser_template.html`), javascript files (TBD), and generated javascript (TBD); the latter of which should handle asset loading from data in `build/assets.yaml`, etc. The output of this is `build/example.html`.
- `tools/simple_server.py`: runs a small http server to serve / display html + js files (generated by `rebuild_phaser_renderer.py` + `webpack`), and assets (unpacked `.pngs` from `extract_assets.py`). Uses `watchdog` to detect file changes + re-run the python + webpack pipeline, and `webbrowser` (builtin) to rebuild + reopen / browse to an observed js file (note: corresponds to the single optional argument to `./run.sh [<file>]`, eg. `./run.sh barrel`). The server will by default run at `localhost:5000` (or whatever `PORT` is set to in `simple_server.py`), and will attempt to reconnect at consecutive addresses (ie. `localhost:5001`, `localhost:5002`, etc), for up to N (default `10-20`) tries, iff the port is blocked. As the port isn't necessarily constant, the currently active server URL is currently written to `build/server.yaml`, for ease of development.
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

- finish map renderer (and move into core...?)
- move + drag camera
- put tile cursor in world so you can select tiles
- map rotation...? (possible; noncritical but could def do this)
- build out map generator framework / API
- MAP GENERATION
- figure how the hell we're going to traverse through one of these maps, IF we're still going to do that...
- map editor...? (noncritical, but user generated maps...?)
- more python backend stuff
- add a digital ocean instance (or just use heroku) so we can deploy this. (note: we don't need to do this until the end of the project, but this is what we'd do for deployment + demoing)
- add all the other TODO items that need to go on this list... >_<

## How map generation + rendering is *supposed* to work:

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
- we only want to use some assets.
- controlled (currently) by `config/asset_config.yaml`.

### Generator API + file structure

TBD, but see eg. `src/generators`
