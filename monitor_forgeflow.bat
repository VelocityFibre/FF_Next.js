@echo off
setlocal enabledelayedexpansion

:: ForgeFlow Monitor Script
:: Monitors ForgeFlow orchestration system and agent status

title ForgeFlow Monitor - FibreFlow React
color 0A

:HEADER
cls
echo ================================================================================
echo                           FORGEFLOW MONITOR v1.0                              
echo                      AI Orchestration System Monitor                           
echo ================================================================================
echo.
echo [%date% %time%] Starting ForgeFlow monitoring...
echo.

:MAIN_LOOP
:: Check Node.js processes
echo [PROCESSES]
echo -----------
echo Checking Node.js processes...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel%==0 (
    echo [+] Node.js processes: RUNNING
    for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list 2^>nul ^| find "PID:"') do (
        echo     - PID: %%a
    )
) else (
    echo [-] Node.js processes: NOT FOUND
)

:: Check Python processes
echo.
echo Checking Python processes...
tasklist /fi "imagename eq python.exe" 2>nul | find /i "python.exe" >nul
if %errorlevel%==0 (
    echo [+] Python processes: RUNNING
    for /f "tokens=2" %%a in ('tasklist /fi "imagename eq python.exe" /fo list 2^>nul ^| find "PID:"') do (
        echo     - PID: %%a
    )
) else (
    echo [-] Python processes: NOT FOUND
)

:: Check development server
echo.
echo [DEVELOPMENT SERVER]
echo --------------------
netstat -an | find "5173" >nul 2>&1
if %errorlevel%==0 (
    echo [+] Dev Server (5173): LISTENING
) else (
    netstat -an | find "5174" >nul 2>&1
    if %errorlevel%==0 (
        echo [+] Dev Server (5174): LISTENING
    ) else (
        netstat -an | find "5175" >nul 2>&1
        if %errorlevel%==0 (
            echo [+] Dev Server (5175): LISTENING
        ) else (
            echo [-] Dev Server: NOT RUNNING
        )
    )
)

:: Check Docker status
echo.
echo [DOCKER STATUS]
echo ---------------
docker ps >nul 2>&1
if %errorlevel%==0 (
    echo [+] Docker: RUNNING
    for /f "tokens=*" %%i in ('docker ps --format "table {{.Names}}\t{{.Status}}" 2^>nul ^| findstr /v "NAMES"') do (
        echo     - %%i
    )
) else (
    echo [-] Docker: NOT AVAILABLE
)

:: Check Firebase/Firestore connection
echo.
echo [FIREBASE STATUS]
echo -----------------
curl -s -o nul -w "%%{http_code}" https://fibreflow-292c7.web.app >temp_status.txt 2>nul
set /p HTTP_STATUS=<temp_status.txt
del temp_status.txt 2>nul
if "!HTTP_STATUS!"=="200" (
    echo [+] Firebase Hosting: ACCESSIBLE
) else if "!HTTP_STATUS!"=="000" (
    echo [-] Firebase Hosting: CONNECTION FAILED
) else (
    echo [?] Firebase Hosting: HTTP !HTTP_STATUS!
)

:: Check PostgreSQL/Neon connection
echo.
echo [DATABASE STATUS]
echo -----------------
:: Check if PostgreSQL is running locally
sc query postgresql 2>nul | find "RUNNING" >nul
if %errorlevel%==0 (
    echo [+] PostgreSQL: RUNNING
) else (
    echo [-] PostgreSQL: NOT RUNNING (Using Neon cloud)
)

:: Memory and CPU usage
echo.
echo [SYSTEM RESOURCES]
echo ------------------
for /f "skip=1" %%p in ('wmic cpu get loadpercentage') do (
    if not "%%p"=="" (
        echo CPU Usage: %%p%%
        if %%p GTR 80 (
            echo [!] WARNING: High CPU usage detected
        )
    )
)

for /f "skip=1" %%m in ('wmic OS get TotalVisibleMemorySize^,FreePhysicalMemory') do (
    for /f "tokens=1,2" %%a in ("%%m") do (
        if not "%%a"=="" if not "%%b"=="" (
            set /a USED=%%b/1024
            set /a TOTAL=%%a/1024
            set /a PERCENT=!USED!*100/!TOTAL!
            echo Memory: !USED!MB / !TOTAL!MB (!PERCENT!%% free^)
            set /a USAGE=100-!PERCENT!
            if !USAGE! GTR 80 (
                echo [!] WARNING: High memory usage detected
            )
        )
    )
)

:: Check for error logs
echo.
echo [ERROR LOGS]
echo ------------
set ERROR_COUNT=0
if exist "dev-tools\testing\test-results\results.json" (
    findstr /i "error failed" "dev-tools\testing\test-results\results.json" >nul 2>&1
    if !errorlevel!==0 (
        echo [!] Errors found in test results
        set /a ERROR_COUNT+=1
    )
)

if exist "npm-debug.log" (
    echo [!] npm-debug.log found
    set /a ERROR_COUNT+=1
)

if exist "yarn-error.log" (
    echo [!] yarn-error.log found
    set /a ERROR_COUNT+=1
)

if !ERROR_COUNT!==0 (
    echo [+] No error logs detected
)

:: Check agent status (mock - would integrate with actual agent system)
echo.
echo [FORGEFLOW AGENTS]
echo ------------------
echo Strategic Planner:     [READY]
echo System Architect:      [READY]
echo Code Implementer:      [READY]
echo Test Validator:        [READY]
echo Quality Reviewer:      [READY]
echo Security Auditor:      [READY]
echo Performance Optimizer: [READY]
echo Deployment Agent:      [READY]

:: Status summary
echo.
echo ================================================================================
echo [SUMMARY] %date% %time%
echo ================================================================================

:: Auto-refresh every 5 seconds
timeout /t 5 /nobreak >nul
goto MAIN_LOOP

:ERROR
echo.
echo [ERROR] An error occurred during monitoring
pause
exit /b 1