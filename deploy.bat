@echo off
REM ============================================================
REM deploy.bat — One-click deployment pipeline
REM   1. Push source to GitHub
REM   2. Upload build artifacts to Hugging Face (storage)
REM   3. Deploy to Firebase Hosting
REM ============================================================

echo ======================================
echo  ArtisanMatch Deployment Pipeline
echo ======================================

REM ── Step 0: Read env vars ──────────────────────────────────
if not exist .env.local (
    echo ERROR: .env.local not found. Create it from .env.example first.
    exit /b 1
)

REM ── Step 1: Install dependencies ───────────────────────────
echo.
echo [1/5] Installing dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)

REM ── Step 2: Build the Next.js app ──────────────────────────
echo.
echo [2/5] Building Next.js app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

REM ── Step 3: Push to GitHub ─────────────────────────────────
echo.
echo [3/5] Pushing to GitHub...
git add -A
git commit -m "deploy: %date% %time%" 2>nul
git push origin main
if errorlevel 1 (
    echo WARNING: Git push failed (may need initial setup)
)

REM ── Step 4: Upload build to Hugging Face ───────────────────
echo.
echo [4/5] Uploading build artifacts to Hugging Face...
python scripts/hf_upload.py
if errorlevel 1 (
    echo WARNING: HF upload failed (optional storage step)
)

REM ── Step 5: Deploy to Firebase Hosting ─────────────────────
echo.
echo [5/5] Deploying to Firebase Hosting...
call npx firebase-tools deploy --only hosting
if errorlevel 1 (
    echo ERROR: Firebase deploy failed
    exit /b 1
)

echo.
echo ======================================
echo  Deployment complete!
echo ======================================
