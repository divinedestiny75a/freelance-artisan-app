"""
kaggle_server.py — Kaggle "Live Server" for ArtisanMatch
=========================================================

This script runs as a Kaggle kernel and acts as a lightweight backend
that periodically pings the Firebase-hosted app and can be extended to:
  - Run background ML tasks (e.g. skill-matching)
  - Process data from the Supabase database
  - Call the NVIDIA API for AI inference
  - Sync files with Hugging Face storage

Environment secrets should be set in Kaggle's "Add-ons → Secrets" panel:
  HF_TOKEN, GITHUB_PAT, NVIDIA_API_KEY, FIREBASE_URL
"""

import os
import json
import time
import requests
from datetime import datetime

# ── Configuration ─────────────────────────────────────────────
# In Kaggle, set these via Settings → Secrets
HF_TOKEN = os.environ.get("HF_TOKEN", "")
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
GITHUB_PAT = os.environ.get("GITHUB_PAT", "")

# Replace with your actual Firebase Hosting URL after deployment
FIREBASE_URL = os.environ.get(
    "FIREBASE_URL",
    "https://artisanmatch-app.web.app"
)


def health_check():
    """Ping the Firebase-hosted app to verify it's alive."""
    try:
        resp = requests.get(FIREBASE_URL, timeout=10)
        print(f"[{datetime.utcnow().isoformat()}] "
              f"Health check: {resp.status_code} "
              f"({len(resp.text)} bytes)")
        return resp.status_code == 200
    except Exception as e:
        print(f"[{datetime.utcnow().isoformat()}] Health check failed: {e}")
        return False


def download_from_hf(repo_id: str = "divinedestiny/freelance-artisan-app"):
    """Download the latest project snapshot from Hugging Face storage."""
    try:
        from huggingface_hub import snapshot_download
        path = snapshot_download(
            repo_id=repo_id,
            repo_type="dataset",
            token=HF_TOKEN,
            local_dir="/kaggle/working/app-snapshot",
        )
        print(f"Downloaded snapshot to: {path}")
        return path
    except Exception as e:
        print(f"HF download failed: {e}")
        return None


def call_nvidia_api(prompt: str):
    """Example: call NVIDIA API for AI inference (e.g. skill matching)."""
    if not NVIDIA_API_KEY:
        print("NVIDIA_API_KEY not set – skipping")
        return None

    try:
        resp = requests.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {NVIDIA_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "meta/llama-3.1-8b-instruct",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 512,
            },
            timeout=30,
        )
        result = resp.json()
        print(f"NVIDIA response: {json.dumps(result, indent=2)[:500]}")
        return result
    except Exception as e:
        print(f"NVIDIA API error: {e}")
        return None


def main():
    print("=" * 50)
    print("  ArtisanMatch Kaggle Live Server")
    print(f"  Started at: {datetime.utcnow().isoformat()}")
    print("=" * 50)

    # 1. Health check the Firebase app
    print("\n── Health Check ──")
    health_check()

    # 2. Download latest files from HF storage
    print("\n── Hugging Face Sync ──")
    download_from_hf()

    # 3. Example NVIDIA AI call (skill matching)
    print("\n── NVIDIA AI Demo ──")
    call_nvidia_api(
        "Given a gig requiring 'plumbing' and 'pipe fitting' skills, "
        "rank these artisans by relevance: "
        "Artisan A (plumbing, welding), "
        "Artisan B (carpentry, painting), "
        "Artisan C (pipe fitting, plumbing, tiling)."
    )

    print("\n── Server cycle complete ──")
    print("Schedule this kernel to run periodically via Kaggle's scheduler.")


if __name__ == "__main__":
    main()
