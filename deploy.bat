@echo off
setlocal EnableDelayedExpansion

echo Starting deployment with disk space check...

REM Get disk free and total bytes from C:
for /f "tokens=3" %%a in ('fsutil volume diskfree C: ^| find "Total # of free bytes"') do set FREE_BYTES=%%a
for /f "tokens=3" %%a in ('fsutil volume diskfree C: ^| find "Total # of bytes"') do set TOTAL_BYTES=%%a

set /a DISK_USAGE=100 - (100 * FREE_BYTES / TOTAL_BYTES)
set /a AVAILABLE_SPACE=FREE_BYTES / 1073741824

echo Disk usage: !DISK_USAGE!%%
echo Available space: !AVAILABLE_SPACE! GB

if !DISK_USAGE! GEQ 80 (
    echo Low disk space detected! Running cleanup...

    if exist docker-cleanup.bat (
        call docker-cleanup.bat
    ) else (
        echo docker-cleanup.bat not found. Skipping cleanup.
    )

    REM Re-check space
    for /f "tokens=3" %%a in ('fsutil volume diskfree C: ^| find "Total # of free bytes"') do set FREE_BYTES=%%a
    set /a DISK_USAGE=100 - (100 * FREE_BYTES / TOTAL_BYTES)
    set /a AVAILABLE_SPACE=FREE_BYTES / 1073741824

    echo Disk usage after cleanup: !DISK_USAGE!%%
    echo Available space after cleanup: !AVAILABLE_SPACE! GB

    if !DISK_USAGE! GEQ 90 (
        echo Still not enough disk space for deployment!
        exit /b 1
    )
)

echo Stopping containers...
docker-compose down

echo Pruning old images...
docker image prune -f

echo Building and starting services...
docker-compose up --build -d

timeout /t 10 >nul

echo Service status:
docker-compose ps

echo Final disk usage:
wmic logicaldisk where "DeviceID='C:'" get size,freespace

echo Deployment completed.
