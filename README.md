# microvis — Bacteria Identifier

An AI-powered bacteria identification web app built with Flask + Python.
Upload a microscope image → get instant species identification with clinical context.

## Tech Stack
- **Flask** — Python web framework
- **Pillow** — Image preprocessing
- **NumPy** — Array computation
- **MobileNetV2** — CNN architecture (ready for real model integration)
- **Gunicorn** — Production WSGI server

---

## 🚀 Deploy to Render (Free — Get a Live Link)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up (free).

### Step 2 — Create a new repository
1. Click the **+** button → **New repository**
2. Name it: `microvis`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload all project files
1. Click **uploading an existing file** on your new repo page
2. Drag and drop ALL files from this folder:
   - app.py
   - requirements.txt
   - Procfile
   - render.yaml
   - templates/ folder (with index.html)
   - static/ folder (with css/ and js/)
3. Click **Commit changes**

### Step 4 — Deploy on Render
1. Go to https://render.com and sign up with your GitHub account (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub account → select your `microvis` repo
4. Render auto-detects everything from render.yaml
5. Click **Create Web Service**
6. Wait ~3 minutes for it to build

### Step 5 — Get your link!
Render gives you a permanent URL like:
```
https://microvis.onrender.com
```
That's it! Share this link with your professor. ✅

---

## Run Locally (Optional)
```bash
pip install -r requirements.txt
python app.py
# Open: http://localhost:5000
```

---

## Project Structure
```
microvis/
├── app.py                  ← Flask server + AI analysis
├── requirements.txt        ← Python dependencies
├── Procfile                ← Render/Heroku start command
├── render.yaml             ← Render deployment config
├── templates/
│   └── index.html          ← Main webpage
└── static/
    ├── css/
    │   └── style.css       ← All styles
    └── js/
        └── main.js         ← Frontend logic + API calls
```

---

Built for microbiology major project · microvis
