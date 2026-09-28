"""
hf_upload.py — Upload build artifacts to Hugging Face Hub (used as file storage).

Usage:
    python scripts/hf_upload.py

Requires:
    pip install huggingface_hub

Environment variables (from .env.local):
    HF_TOKEN   — Your Hugging Face API token
"""
import os
import sys
from pathlib import Path

def main():
    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("Installing huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface_hub -q")
        from huggingface_hub import HfApi, create_repo

    # Load token from environment or .env.local
    token = os.environ.get("HF_TOKEN")
    if not token:
        env_path = Path(__file__).parent.parent / ".env.local"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("HF_TOKEN="):
                    token = line.split("=", 1)[1].strip()
                    break

    if not token:
        print("ERROR: HF_TOKEN not found in environment or .env.local")
        sys.exit(1)

    repo_id = "divinedestiny/freelance-artisan-app"
    api = HfApi(token=token)

    # Create repo if it doesn't exist (type="dataset" for general file storage)
    try:
        create_repo(repo_id, repo_type="dataset", token=token, exist_ok=True)
        print(f"Repo '{repo_id}' is ready on Hugging Face.")
    except Exception as e:
        print(f"Repo creation note: {e}")

    # Upload the entire project (excluding node_modules, .next, .env files)
    project_root = Path(__file__).parent.parent
    ignore_patterns = [
        "node_modules",
        ".next",
        ".env",
        ".env.local",
        ".git",
        "*.log",
        "__pycache__",
    ]

    print(f"Uploading project files to hf.co/datasets/{repo_id} ...")
    api.upload_folder(
        folder_path=str(project_root),
        repo_id=repo_id,
        repo_type="dataset",
        token=token,
        ignore_patterns=ignore_patterns,
        commit_message=f"Auto-upload from deploy script",
    )
    print("Upload complete!")


if __name__ == "__main__":
    main()
