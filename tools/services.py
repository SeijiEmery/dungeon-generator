
class Main:
    def __init__(self):
        self.main_fcn = None

    def __call__(self, fcn):
        self.main_fcn = fcn
        return fcn

    def start(self, *args, **kwargs):
        self.main_fcn(*args, **kwargs)


main = Main()


class Runner:
    def __init__(self, fcn):
        self.fcn = fcn

    def run(self, *args, **kwargs):
        self.fcn(*args, **kwargs)


def start_services(**services):
    services = list(services.values())

    def run(*args, **kwargs):
        if len(services) == 1:
            services[0].run()
        elif len(services) > 0:
            pass
    return Runner(run)


if __name__ == '__main__':
    @main
    def hello(msg):
        print("{msg}, world!".format(msg=msg))

    main.start(msg="Hello")
