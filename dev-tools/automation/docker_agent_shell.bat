@echo off
REM Docker Agent Shell - Intercepts all commands and ensures Docker agent usage

echo ============================================================
echo DOCKER AGENT SHELL ACTIVE - All commands routed through Docker agents
echo ============================================================

REM Check if Docker agents are running
curl -s http://localhost:8052/health > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker agents not running!
    echo Starting Docker agents...
    cd /d "C:\Jarvis\AI Workspace\Archon"
    docker-compose up -d archon-agents
    timeout /t 5 > nul
)

REM Auto-run CLAUDE_INIT.py if it exists
if exist CLAUDE_INIT.py (
    echo Initializing Docker agents for this project...
    python CLAUDE_INIT.py
)

REM Set up command aliases
doskey python=python trigger_docker_agents.py health $T python $*
doskey npm=python trigger_docker_agents.py health $T npm $*
doskey node=python trigger_docker_agents.py health $T node $*
doskey git=python trigger_docker_agents.py health $T git $*

echo.
echo Docker Agent Commands Available:
echo   analyze [requirements] - Analyze project requirements
echo   workflow [feature] [requirements] - Run full workflow
echo   status - Check current status
echo   health - Check Docker agent health
echo.

REM Start command prompt with Docker agent enforcement
cmd /k