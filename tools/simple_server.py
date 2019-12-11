import webbrowser
import watchdog
import sys
import os
from extract_assets import extract_all_assets
from rebuild_phaser_renderer import \
    rebuild_phaser, generate_assets_js, generate_config_js, \
    generate_webpack_builds
from utils import load_yaml, write_yaml

URL = 'pure-stream-12121.herokuapp.com'
PORT = 5000
MAX_PORT_OPEN_ATTEMPTS = 20
SERVER_ADDRESS = ('', PORT)

if len(sys.argv) == 2:
    OBSERVED_PATH = '../build/%s.html' % sys.argv[1]
else:
    OBSERVED_PATH = '../build'


def try_kill_listening_port(port):
    return False
    import subprocess
    print("Attempting to kill process running on port %s" % port)
    subprocess.run("lsof -ti:%s | xargs kill" % port, shell=True, check=True)
    return True


def make_server_active(url):
    write_yaml('../build/server.yaml', {'url': url})


def get_server_url():
    url = None

    def get_url():
        nonlocal url
        if not url:
            try:
                url = load_yaml('../build/server.yaml')['url']
            except:
                raise Exception("Server not currently active!")
        return url
    return get_url


get_server_url = get_server_url()


def resolve_url(path):
    if path.startswith('../build'):
        return path.replace('../build', get_server_url())
    raise Exception(
        "unable to resolve url: path '%s' not available on the server!" % path)


def open_observed_file(path=OBSERVED_PATH):
    webbrowser.open(resolve_url(path))


def run_tcp_server(address, port, path, open_in_browser=True):
    import http.server
    import socketserver
    os.chdir(path)
    try_launch = True
    max_tries = MAX_PORT_OPEN_ATTEMPTS
    while try_launch:
        try_launch = False
        try:
            Handler = http.server.SimpleHTTPRequestHandler
            with socketserver.TCPServer((address, port), Handler) as httpd:
                url = '%s:%s' % (URL, port)
                make_server_active(url)
                print("serving '%s' at %s:%s" %
                        (path, URL, port))
                if open_in_browser:
                    open_observed_file()
                httpd.serve_forever(0.5)
        except OSError:
            if max_tries < 0:
                print("Failed to find open port; exiting")
            elif try_kill_listening_port(port):
                try_launch = True
            elif max_tries > 0:
                print("Failed to launch at port %s, trying %s" %
                        (port, port + 1))
                port += 1
                try_launch = True
                max_tries -= 1


def launch_server():
    if not os.path.exists('../build/assets'):
        extract_all_assets()
    rebuild_phaser()

    def launch_tcp_server(*args):
        from multiprocessing import Process

        class ProcessLauncher:
            def __init__(self, target, *args):
                self.target = target
                self.args = args

            def __enter__(self):
                self.process = Process(target=self.target, args=self.args)
                self.process.start()

            def __exit__(self, type, value, traceback):
                self.process.join()
        return ProcessLauncher(run_tcp_server, *args)

    with launch_tcp_server(*SERVER_ADDRESS, '../build'):
        run_observers()


def run_observers():
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    import time

    class Handler (FileSystemEventHandler):
        def on_any_event(self, event):
            def relaunch_self():
                pass

            def maybe_rebuild_phaser():
                if not event.src_path.startswith('../src/generated'):
                    generate_webpack_builds()

            def rebuild_assets():
                generate_assets_js()
                generate_webpack_builds()

            event_handlers = {
                '../assets': (extract_all_assets, rebuild_assets),
                '../config': (generate_config_js, maybe_rebuild_phaser),
                '../templates': (maybe_rebuild_phaser,),
                '../tools': (relaunch_self,),
                '../src': (maybe_rebuild_phaser,),
            }
            for path, actions in event_handlers.items():
                if event.src_path.startswith(path):
                    print("triggered: %s, %s" % (path, event.src_path))
                    for action in actions:
                        action()
                    open_observed_file()
                    break

    observer = Observer()
    observer.schedule(Handler(), '..', recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == '__main__':
    launch_server()
