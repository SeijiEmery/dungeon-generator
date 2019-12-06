
class Main:
    def __init__(self):
        self.main_fcn = None

    def __call__(self, fcn):
        self.main_fcn = fcn
        return fcn

    def start(self, *args, **kwargs):
        self.main_fcn(*args, **kwargs)


main = Main()


def start_services(services):
    if len(services) == 1:
        services[0]()
    elif len(services) > 0:
        pass


if __name__ == '__main__':
    @main
    def hello(msg):
        print("{msg}, world!".format(msg=msg))

    main.start(msg="Hello")
