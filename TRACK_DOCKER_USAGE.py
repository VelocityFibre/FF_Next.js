#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Track if Docker agents are being used
Creates a log file when trigger_docker_agents.py is executed
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def log_trigger_usage():
    """Log when trigger script is used."""
    log_file = Path(__file__).parent / "docker_agent_usage.log"
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat()} - trigger_docker_agents.py executed\n")
    
    print(f"✅ Docker agent usage logged to {log_file}")

if __name__ == "__main__":
    log_trigger_usage()