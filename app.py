import logging

from flask import Flask, jsonify, render_template

import config
from services.google_drive import fetch_photos

logging.basicConfig(level=logging.DEBUG if config.DEBUG else logging.INFO)

app = Flask(__name__)
app.config["DEBUG"] = config.DEBUG


@app.context_processor
def inject_globals():
    return {
        "event_name": config.EVENT_NAME,
        "refresh_interval": config.REFRESH_INTERVAL,
        "enable_download": config.ENABLE_DOWNLOAD,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/gallery")
def gallery():
    photos = fetch_photos()
    return render_template("gallery.html", photos=photos)


@app.route("/api/photos")
def api_photos():
    photos = fetch_photos()
    return jsonify(photos)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=config.DEBUG)
