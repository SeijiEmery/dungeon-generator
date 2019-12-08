

class Vfs:
    def __init__(self, workdir, cache, actions):
        self.workdir = workdir
        self.cachedir = cache
        self.actions = actions

    def run(self):
        pass


def create(*args, **kwargs):
    return Vfs(*args, **kwargs)


def each(path, action=None):
    if action is not None:
        return VfsEachWithAction(path, action)
    return VfsEachWithoutAction(path)


def with_all_js_imports(fcn, srcdir, ext):
    return VfsGetJsImportsAction(fcn, srcdir, ext)


class VfsPipelineAction:
    def __init__(self, action):
        self.action = action
        self.next = None

    def then(self, action):
        self.next = VfsPipelineAction(action)
        return self.next


class VfsEachWithAction:
    def __init__(self, path, action):
        self.path = path
        self.each_action = action
        self.accumulate_action = None

    def accumulate(self, action):
        self.accumulate_action = VfsPipelineAction(action)
        return self.accumulate_action


class VfsEachWithoutAction:
    def __init__(self, path):
        self.path = path
        self.each_action = None

    def then(self, action):
        self.each_action = VfsPipelineAction(action)
        return self.each_action


class VfsGetJsImportsAction:
    def __init__(self, fcn, srcdir, ext):
        self.fcn = fcn
        self.srcdir = srcdir
        self.ext = ext
        self.next = None

    def then(self, action):
        self.next = VfsPipelineAction(next)
        return self.next


class VfsEachPipeline:
    def __init__(self, path, action=None):
        self.path = path
        self.action = action












