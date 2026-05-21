# Starry Night Photobooth

A modern photobooth gallery web app with a **Starry Night** aesthetic (inspired by Van Gogh, with original CSS backgrounds — no copyrighted artwork). Built with **Flask**, **Jinja2**, **Tailwind CSS**, and **Vanilla JavaScript**.

Photos are loaded in real time from **Google Drive** via a **Google Apps Script** JSON API. No database. No file uploads on the website.

---

## Features

- **Homepage** — Fullscreen hero, animated starfield, glowing moon, parallax swirls
- **Gallery** — Masonry grid, auto-refresh every 5 seconds, lightbox, download, lazy loading, skeleton & empty states
- **Navbar** — Glassmorphism, responsive mobile menu
- **Footer** — Configurable event name

---

## Project Structure

```
project/
├── app.py
├── wsgi.py
├── config.py
├── requirements.txt
├── services/
│   └── google_drive.py
├── static/
│   ├── css/main.css
│   ├── js/ (stars, main, parallax, gallery)
│   ├── img/
│   └── effects/
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── gallery.html
│   └── components/
├── google-apps-script/
│   └── Code.gs
└── README.md
```

---

## Requirements

- Python 3.10+
- Google account (Drive + Apps Script)

---

## Installation

### 1. Clone & enter project

```bash
cd photobooth-prom-2026
```

### 2. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

Copy the example env file and edit values:

```bash
cp .env.example .env
```

Or set variables directly in `config.py` / shell:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_APPS_SCRIPT_URL` | Web App URL from Apps Script | placeholder |
| `REFRESH_INTERVAL` | Gallery refresh (seconds) | `5` |
| `EVENT_NAME` | Footer & hero event label | `Prom Night 2026` |
| `ENABLE_DOWNLOAD` | Show download in lightbox | `true` |
| `FLASK_DEBUG` | Flask debug mode | `false` |

Export before running (optional):

```bash
export GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/xxxxx/exec"
export EVENT_NAME="Senior Prom 2026"
```

### 5. Run Flask

```bash
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000)

**Production (Gunicorn):**

```bash
gunicorn -w 2 -b 0.0.0.0:5000 wsgi:application
```

---

## Google Apps Script Setup

### 1. Google Drive folder

1. Create a folder for photobooth output (e.g. `Photobooth Uploads`).
2. Copy the **Folder ID** from the URL:  
   `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### 2. Apps Script project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Paste code from `google-apps-script/Code.gs`.
3. Replace `YOUR_GOOGLE_DRIVE_FOLDER_ID` with your folder ID.
4. Save the project.

### 3. Deploy as Web App

1. **Deploy** → **New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me  
4. **Who has access:** Anyone  
5. Deploy and copy the **Web App URL** (ends with `/exec`).

### 4. Connect to Flask

Set `GOOGLE_APPS_SCRIPT_URL` in `.env` or `config.py` to that URL.

### 5. API response format

```json
[
  {
    "name": "IMG_001.jpg",
    "url": "https://drive.google.com/uc?export=view&id=FILE_ID",
    "thumbnail": "https://drive.google.com/thumbnail?id=FILE_ID&sz=w800",
    "createdTime": "2026-05-20T10:00:00.000Z"
  }
]
```

### CORS

The gallery loads photos through Flask (`/api/photos`), which fetches Apps Script server-side. Browsers do not need direct CORS to Google from your site. If you call the script URL from the browser elsewhere, deploy with **Anyone** access so `doGet` is public.

### Drive permissions

- Photobooth software should save images into the configured folder.
- For private files, use **Anyone with the link** on the folder or shared service account; the sample script uses direct view/thumbnail links.

---

## Flask Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/gallery` | Gallery (SSR initial load) |
| `/api/photos` | JSON photo list for auto-refresh |

---

## Deploy to Jagoan Hosting

### Setup Python App

1. Log in to **Jagoan Hosting** control panel.
2. Open **Setup Python App** (or **Python Selector**).
3. Create a new application:
   - **Python version:** 3.10 or newer
   - **Application root:** folder containing `app.py` (e.g. `photobooth-prom-2026`)
   - **Application URL:** your domain or subdomain
   - **Application startup file:** `wsgi.py`
   - **Application callable:** `application`
4. Upload project files (FTP/File Manager/Git).
5. In the Python app UI, run:

   ```bash
   pip install -r requirements.txt
   ```

6. Set environment variables in the panel (or a `.env` file if supported):

   - `GOOGLE_APPS_SCRIPT_URL`
   - `EVENT_NAME`
   - `REFRESH_INTERVAL`
   - `ENABLE_DOWNLOAD`
   - `FLASK_DEBUG=false`

7. **Restart** the Python application.

### Alternative: Passenger / WSGI

If the host uses `passenger_wsgi.py`, point it to:

```python
from wsgi import application
```

### Static files

Flask serves `static/` automatically. For heavy traffic, optionally put `static/` behind CDN; not required for typical event usage.

### HTTPS

Enable SSL in the hosting panel so gallery and API work over HTTPS.

---

## Configuration Reference (`config.py`)

```python
GOOGLE_APPS_SCRIPT_URL  # Apps Script Web App URL
REFRESH_INTERVAL        # seconds (frontend + docs)
EVENT_NAME              # branding text
ENABLE_DOWNLOAD         # lightbox download button
DEBUG                   # Flask debug
```

---

## Development Tips

- Without a valid Apps Script URL, the gallery shows the **empty state** (no crash).
- Change colors in `static/css/main.css` and Tailwind config in `templates/base.html`.
- Adjust star count/performance in `static/js/stars.js`.
- Gallery polling interval: `REFRESH_INTERVAL` in config and `GALLERY_CONFIG` on the gallery page.

---

## License

See [LICENSE](LICENSE) in this repository.
