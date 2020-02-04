# Author: Chuan Wang
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST", "GET"])
def index():
    return jsonify({'abc': 'ddd', 'bbd': 'ccc'});

@app.route("/data", methods=["GET"])
def data():
    return jsonify({'nnn': 'ddd', 'qqq': 'ccc'});


if __name__ == "__main__":
    app.run(debug=True)
