# 🚨 MANDATORY: Docker Agent Commands for FibreFlow_React

**CRITICAL**: All development work MUST use Docker agents. These commands route your work through the centralized 13-agent orchestration system.

## Essential Commands

### Start Any Work
```bash
# ALWAYS run this before starting any task:
python trigger_docker_agents.py analyze --requirements "Brief description of what you're working on"
```

### Complete Workflows
```bash
# For full feature development:
python trigger_docker_agents.py workflow --feature "Feature description" --requirements "User requirements"

# Individual phases:
python trigger_docker_agents.py spec --feature "Feature description"
python trigger_docker_agents.py tasks
python trigger_docker_agents.py execute  
python trigger_docker_agents.py complete
```

### Status & Health
```bash
# Check agent system status:
python trigger_docker_agents.py health
python trigger_docker_agents.py status
```

## Why Use Docker Agents?

- **13 Specialized Agents**: Context, Product, Builder, Security, Testing, UX, Architect, Workflow, Orchestrator, Automation, Document, RAG, Spec-driven workflow
- **Zero Tolerance Quality**: All agents enforce 95%+ test coverage, zero lint errors, security compliance
- **Cross-Project Learning**: Agents build knowledge across all connected projects
- **Enhanced Logging**: All activity visible in Docker logs with project/agent identification

## Project Context

**Project ID**: `fibreflow-react`  
**Docker Agents Port**: `localhost:8052`  
**Enhanced Logging**: Enabled with emoji format showing `🔍 [PROJECT: fibreflow-react] [AGENT: context]`

**NEVER work independently - always route through Docker agents!**