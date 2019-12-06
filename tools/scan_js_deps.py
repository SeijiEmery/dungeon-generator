import os
import utils
import re
import hashlib


def scanfiles(rootdir='../src', ext='.js'):
    return [
        os.path.join(root, file)
        for root, dirs, files in os.walk(rootdir)
        for file in files
        if file.endswith(ext)
    ]


def scan_js_file(srcfile):
    src = utils.load_file(srcfile)
    basepath = os.path.split(srcfile)[0]

    def find_imports():
        r = re.compile(
            r'import\s*(\w+|\{[^\}]*\})\s*from\s*[\'"]([^\'"]+)[\'"]')
        for match in re.finditer(r, src):
            path = os.path.relpath(os.path.join(basepath, match.group(2)))
            if os.path.exists(path + '.js'):
                yield path + '.js'
                continue
            elif os.path.exists(path + '.json'):
                yield path + '.json'
                continue
            print("Could not resolve import '%s' in '%s'" % (path, srcfile))

    return {
        'imports': list(find_imports()),
        'hash': hashlib.sha1(src.encode('utf-8')).hexdigest()
    }


def scan_js_deps(srcdir='../src', entrypoints_dir='../src/tests'):
    src_files = scanfiles(srcdir, ext='.js')
    src_deps = {
        src: scan_js_file(src)
        for src in src_files
    }
    # for k, v in src_deps.items():
    #     print('%s:' % k)
    #     for path in v['imports']:
    #         print('   imports %s' % path)

    def get_deps(src, visited):
        if src in src_deps:
            for dep in src_deps[src]['imports']:
                if dep not in visited:
                    visited.add(dep)
                    yield dep
                    for dep in get_deps(dep, visited):
                        yield dep

    def get_all_deps(deps):
        all_deps = {}
        visited = set()
        for src in deps.keys():
            all_deps[src] = {
                'imports': list(get_deps(src, visited)),
                'hash': deps[src]['hash'],
            }
            visited.clear()
        return all_deps

    src_deps = get_all_deps(src_deps)

    for k, v in src_deps.items():
        print('%s (hash %s):' % (k, v['hash']))
        for path in v['imports']:
            print('   imports %s' % path)

    deps_to_reqs = {}
    for req, deps in src_deps.items():
        if req not in deps_to_reqs:
            deps_to_reqs[req] = set()
        for dep in deps['imports']:
            deps_to_reqs[req].add(dep)

    for dep, reqs in deps_to_reqs.items():
        print('%s => [%s]' % (dep, ', '.join(reqs)))


if __name__ == '__main__':
    scan_js_deps()
