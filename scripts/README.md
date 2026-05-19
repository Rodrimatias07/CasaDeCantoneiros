# Gallery data scripts

This folder contains helper scripts to generate and watch the project gallery data.

Files
- `generate-gallery-data.py` — scans `images/galeria/*` and writes `js/gallery-data.js`.
- `watch-gallery.py` — polls `images/galeria` and runs `generate-gallery-data.py` when files change.

Usage

Activate your Python environment (optional but recommended):

```powershell
& ".venv\Scripts\Activate.ps1"
```

Generate once:

```powershell
python scripts/generate-gallery-data.py
```

Start the watcher (runs continuously, polls every 2s):

```powershell
python scripts/watch-gallery.py
```

