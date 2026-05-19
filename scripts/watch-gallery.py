#!/usr/bin/env python3
"""
Watch the images/galeria folder and regenerate js/gallery-data.js when files change.

Usage:
  python scripts/watch-gallery.py

This script polls the gallery folder for changes (safe for environments without watchdog).
It calls the existing `scripts/generate-gallery-data.py` script when a change is detected.
"""
from __future__ import annotations
import hashlib
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / 'images' / 'galeria'
GEN_SCRIPT = ROOT / 'scripts' / 'generate-gallery-data.py'
POLL_INTERVAL = 2.0


def snapshot_dir(path: Path) -> str:
    """Return a stable hash representing the filenames and mtimes under path."""
    entries = []
    for root, _, files in os.walk(path, topdown=True):
        for f in sorted(files):
            p = Path(root) / f
            try:
                st = p.stat()
                entries.append(f"{p.relative_to(path)}:{st.st_mtime_ns}:{st.st_size}")
            except OSError:
                # file might vanish during listing
                continue
    s = "\n".join(entries).encode('utf-8')
    return hashlib.sha1(s).hexdigest()


def regen_once() -> bool:
    """Run the generator script once. Returns True on success."""
    if not GEN_SCRIPT.exists():
        print(f"Generator script not found: {GEN_SCRIPT}")
        return False
    try:
        print("[watch-gallery] Regenerating gallery data...")
        res = subprocess.run([sys.executable, str(GEN_SCRIPT)], cwd=str(GEN_SCRIPT.parent), check=False)
        if res.returncode == 0:
            print("[watch-gallery] Generated js/gallery-data.js OK")
            return True
        else:
            print(f"[watch-gallery] Generator exited with code {res.returncode}")
            return False
    except Exception as e:
        print(f"[watch-gallery] Failed to run generator: {e}")
        return False


def main() -> int:
    if not GALLERY_DIR.exists():
        print(f"Gallery folder not found: {GALLERY_DIR}")
        return 1

    # initial run
    regen_once()
    last = snapshot_dir(GALLERY_DIR)
    print(f"[watch-gallery] Watching {GALLERY_DIR} (poll every {POLL_INTERVAL}s). Ctrl-C to stop.")
    try:
        while True:
            time.sleep(POLL_INTERVAL)
            snap = snapshot_dir(GALLERY_DIR)
            if snap != last:
                print("[watch-gallery] Change detected, regenerating...")
                regen_once()
                last = snap
    except KeyboardInterrupt:
        print('\n[watch-gallery] Stopped by user')
        return 0


if __name__ == '__main__':
    raise SystemExit(main())
