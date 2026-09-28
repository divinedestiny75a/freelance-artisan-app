@echo off
REM Create GitHub repo via API
curl -s -X POST https://api.github.com/user/repos ^
  -H "Authorization: token %GITHUB_PAT%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"freelance-artisan-app\",\"description\":\"ArtisanMatch - Connect rural artisans with gigs\",\"private\":false}"
