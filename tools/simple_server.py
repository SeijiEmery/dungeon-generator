import webbrowser
import watchdog
import sys
import os
from extract_assets import extract_all_assets
from rebuild_phaser_renderer import \
    rebuild_phaser, generate_assets_js, generate_config_js, \
    generate_webpack_builds
from utils import load_yaml, write_yaml
import time

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
                url = 'http://127.0.0.1:%s' % port
                make_server_active(url)
                print("serving '%s' at http://127.0.0.1:%s" %
                        (path, port))
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
    # rebuild_phaser()

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
        try:
            run_file_watchers()
        except Exception as e:
            print(e)
            sys.exit(-1)


def run_file_watchers():
    from watchdog.utils.dirsnapshot import DirectorySnapshot, DirectorySnapshotDiff

    # rebuild_assets()
    # generate_assets_js()
    # generate_config_js()
    # generate_webpack_builds()
    # open_observed_file()

    def make_snapshots():
        return {
            'assets': DirectorySnapshot('../assets', recursive=False),
            'build': DirectorySnapshot('../build', recursive=False),
            'config': DirectorySnapshot('../config', recursive=True),
            'templates': DirectorySnapshot('../templates', recursive=True),
            'src': DirectorySnapshot('../src', recursive=True),
            'tools': DirectorySnapshot('../tools', recursive=False),
        }

    def update_snapshots(snapshots):
        new_snapshots = make_snapshots()
        return new_snapshots, {
            key: DirectorySnapshotDiff(snapshots[key], new_snapshots[key])
            for key in snapshots.keys()
        }

    snapshots = make_snapshots()
    print(snapshots)
    changes = []
    while True:
        time.sleep(0.5)
        changes.clear()
        snapshots, all_changes = update_snapshots(snapshots)
        for prefix, events in all_changes.items():
            if events.dirs_created:
                for path in events.dirs_created:
                    changes.append((prefix, 'created', path, True))
            if events.dirs_modified:
                for path in events.dirs_modified:
                    changes.append((prefix, 'created', path, True))
            if events.dirs_deleted:
                for path in events.dirs_deleted:
                    changes.append((prefix, 'created', path, True))
            if events.dirs_moved:
                for (from_file, to_file) in events.dirs_moved:
                    changes.append((prefix, 'moved', (from_file, to_file), True))
            if events.files_created:
                for path in events.files_created:
                    changes.append((prefix, 'created', path, False))
            if events.files_modified:
                for path in events.files_modified:
                    changes.append((prefix, 'created', path, False))
            if events.files_deleted:
                for path in events.files_deleted:
                    changes.append((prefix, 'created', path, False))
            if events.files_moved:
                for (from_file, to_file) in events.files_moved:
                    changes.append((prefix, 'moved', (from_file, to_file), False))

        def handle_asset_change(action, path, is_dir):
            if 'asset_config.yaml' in path:
                print('rebuilding asset_config.yaml -> ...')
                generate_assets_js()
            else:
                rebuild_assets()

        def handle_config_change(action, path, is_dir):
            if 'config.yaml' in path:
                print('rebuilding config.yaml -> ...')
                generate_config_js()

        def handle_js_change(action, path, is_dir):
            if path.startswith('../src/generated'):
                return
            rebuild_phaser()

        def handle_template_html_change(action, path, is_dir):
            if path.endswith('.html'):
                print('rebuilding asset_config.yaml -> ...')
                rebuild_phaser()

        def handle_py_change(action, path, is_dir):
            pass

        rebuild_detected = False

        def handle_build_change(action, path, is_dir):
            nonlocal rebuild_detected
            base, file = os.path.split(path)
            if base == '../build' and (file.endswith('.js') or file.endswith('.html')):
                rebuild_detected = True
                print('rebuilt %s' % path)

        handlers = {
            'assets': handle_asset_change,
            'config': handle_config_change,
            'src': handle_js_change,
            'tools': handle_py_change,
            'templates': handle_template_html_change,
            'build': handle_build_change,
        }
        for prefix, action, path, is_dir in changes:
            if prefix in handlers:
                handlers[prefix](action, path, is_dir)
            else:
                print("unhandled prefix: '%s'" % prefix)

        if rebuild_detected:
            open_observed_file()

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
            detected_rebuild = False
            for path, actions in event_handlers.items():
                if event.src_path.startswith(path):
                    start = time.time()
                    print("triggered: %s, %s" % (path, event.src_path))
                    for action in actions:
                        action()
                    # open_observed_file()
                    print("updated in %0.2f second(s)" % (time.time() - start))
                    break

                if OBSERVED_PATH.endswith('.html'):
                    if event.src_path == OBSERVED_PATH or event.src_path.replace('.js', '.html') == OBSERVED_PATH:
                        detected_rebuild = True
                        print("rebuild detected on '%s'" % event.src_path)
                    else:
                        print("skipping event '%s'" % event.src_path)
                # elif event.src_path.startswith('../build'):
                #     path = event.src_path.strip('../build')
                #     base, file = os.path.split(path)
                #     if base == '' and file.endswith('.js'):
                #         detected_rebuild = True
            if detected_rebuild:
                open_observed_file()

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
