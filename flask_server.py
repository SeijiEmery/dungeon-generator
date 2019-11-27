from flask import Flask
from tools import rebuild
import webbrowser
import sys

HTTP_ENDPOINT = 'http://127.0.0.1:5000'


app = Flask(__name__, static_folder='build', static_url_path='/static')


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else 'barrel'
    target.strip('.html')
    rebuild()
    EXAMPLE_URL = HTTP_ENDPOINT + '/static/%s.html' % target
    print(EXAMPLE_URL)
    webbrowser.open_new(EXAMPLE_URL)
    app.run(debug=True)
