@echo off
title Push Impact Loop Blogs to GitHub
cd /d "%~dp0"
set LOGFILE=%~dp0push-log.txt

echo === START %date% %time% === > "%LOGFILE%"

REM Clear OneDrive-induced locks and rebuild corrupt index if needed
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\index" (
  git fsck --no-dangling >> "%LOGFILE%" 2>&1
  if errorlevel 1 (
    echo Rebuilding corrupt git index... >> "%LOGFILE%"
    del /f ".git\index"
    git reset >> "%LOGFILE%" 2>&1
  )
)

git config user.name "Rovonn Russell" >> "%LOGFILE%" 2>&1
git config user.email "rovonn@rovonnrussell.com" >> "%LOGFILE%" 2>&1
git config core.fileMode false >> "%LOGFILE%" 2>&1
git config pull.rebase true >> "%LOGFILE%" 2>&1

git fetch origin >> "%LOGFILE%" 2>&1
git pull --rebase --autostash origin main >> "%LOGFILE%" 2>&1

git status --short >> "%LOGFILE%" 2>&1
echo. >> "%LOGFILE%"

git add -A >> "%LOGFILE%" 2>&1
git commit -m "Add ADAPT for Nonprofits article + Nonprofit AI Adoption Workbook source" -m "content/impact-loop/adapt-for-nonprofits-tailoring-ai-without-losing-the-mission.mdx — flagship article (3128 words, Strategy category, published: false). The article also lives in impact-loop-website/content/blog/ for the new local-MDX blog at impactloop.ca/blog. This Sanity copy stays as legacy until the subdomain is sunset." -m "docs/nonprofit-ai-workbook-source.md — full markdown source for the Nonprofit AI Adoption Workbook PDF (22 pages, lives in impact-loop-website public/resources/)." >> "%LOGFILE%" 2>&1

git push origin main >> "%LOGFILE%" 2>&1
set PUSH_RESULT=%errorlevel%

git log --oneline -3 >> "%LOGFILE%" 2>&1
echo. >> "%LOGFILE%"

if %PUSH_RESULT%==0 (
  echo === PUSH OK === >> "%LOGFILE%"
) else (
  echo === PUSH FAILED %PUSH_RESULT% === >> "%LOGFILE%"
)

timeout /t 30 /nobreak
exit /b %PUSH_RESULT%
