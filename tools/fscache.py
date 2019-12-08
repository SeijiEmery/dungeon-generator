import os
import hashlib
import codecs
import pickle
import time

MAX_GENERATIONS = 2 ** 31


class FileScanner:
    def __init__(self, cache_path='../build/fscache.pkl', rebuild=False):
        default_attribs = {
            'generation': 0,
            'stat_info': {},
            'last_stat_info': {},
            'content_cache': {},
            'content_hash': {},
            'last_walk_time': 0.0,
        }
        if not rebuild and os.path.exists(cache_path):
            with open(cache_path, 'r') as f:
                attribs = pickle.load(f)
                default_attribs.update({
                    k: attribs[k]
                    for k in default_attribs.keys()
                })
        self.__dict__.update(default_attribs)
        self.cache_path = cache_path

    def save_cache(self):
        with open(self.cache_path, 'w') as f:
            pickle.dump(self.__dict__, f)

    def advance_generation(self):
        self.generation = (self.generation + 1) % MAX_GENERATIONS

    def get_info(self, path):
        if not os.path.exists(path):
            return '<none>'

        if path in self.stat_info:
            gen, info = self.stat_info[path]
            if gen == self.generation:
                return info

        stat = os.stat(path)
        info = {
            'added': stat.st_atime,
            'modified': stat.st_mtime,
            'created': stat.st_ctime,
            'size': stat.st_size,
        }
        if os.path.isdir(path):
            children = [
                self.get_info(os.path.join(path, file))
                for file in os.listdir(path)
            ]
            children.append(info)
            info = {
                'added': max([info['added'] for info in children]),
                'modified': max([info['modified'] for info in children]),
                'created': max([info['created'] for info in children]),
                'size': sum([info['size'] for info in children])
            }
        self.stat_info[path] = (self.generation, info)
        return info

    def load_file(self, path):
        if self.last_walk_time > time.time() + 0.1:
            self.last_walk_time = time.time()
            self.advance_generation()

        old_info = self.last_stat_info[path] if path in self.last_stat_info else '<none>'
        new_info = self.get_info(path)
        if new_info != old_info or path not in self.content_cache:
            self.last_stat_info[path] = new_info
            with codecs.open(path, 'r', encoding='utf-8', errors='ignore') as f:
                self.content_cache[path] = f.read()
        return self.content_cache[path]

    def changed(self, path, use_cached=False):
        if not use_cached:
            self.advance_generation()
        old_info = self.last_stat_info[path] if path in self.last_stat_info else '<none>'
        new_info = self.get_info(path)
        return new_info != old_info

    def get_hash_of(self, content):
        return hashlib.sha1(content.encode('utf-8')).hexdigest()

    def get_hash(self, path):
        if not os.path.exists(path):
            return ''
        if os.path.isdir(path):
            content_hash = self.get_hash_of('\n'.join([
                str(self.get_info(os.path.join(path, file)))
                for file in os.listdir(path)
            ]))
        else:
            content_hash = self.get_hash_of(self.load_file(path))
        return content_hash

    def save_file(self, path, content):
        if self.last_walk_time > time.time() + 0.1:
            self.last_walk_time = time.time()
            self.advance_generation()
        if os.path.exists(path) and self.get_hash(path) == self.get_hash_of(content):
            print('skipping write to %s (nothing changed)' % path)
            return False
        with open(path, 'w') as f:
            f.write(content)
            self.content_cache[path] = content
        return True


if __name__ == '__main__':
    scanner = FileScanner(rebuild=True)
    for root, dirs, files in os.walk('..'):
        for dir in dirs:
            path = os.path.join(root, dir)
            print('%s: %s %s'%(path, scanner.get_hash(path), scanner.get_info(path)))
        for file in files:
            path = os.path.join(root, file)
            print('%s: %s %s'%(path, scanner.get_hash(path), scanner.get_info(path)))
