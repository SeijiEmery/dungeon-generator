from flask import Flask
from tools import rebuild
import webbrowser

HTTP_ENDPOINT = 'http://127.0.0.1:5000'


app = Flask(__name__, static_folder='build', static_url_path='/static')

if __name__ == "__main__":
    rebuild()
    EXAMPLE_URL = HTTP_ENDPOINT + '/static/example.html'
    print(EXAMPLE_URL)
    webbrowser.open_new(EXAMPLE_URL)
    app.run(debug=True)
