# 🤖 Universal Archon Integration

**Copy this file to `.cursor/commands/` in ANY project to connect to centralized Archon system**

## 🚀 Quick Start

### Health Check
```bash
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" health
```

### Full Agent OS Workflow
```bash
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" workflow --feature "{{FEATURE_DESCRIPTION}}" --requirements "{{USER_REQUIREMENTS}}"
```

## 📡 System Endpoints

- **Docker Agents**: http://localhost:8052 (13 specialized agents)
- **MCP Server**: http://localhost:8051 (Knowledge & task management)
- **Main Server**: http://localhost:8181 (Core API)
- **UI Dashboard**: http://localhost:3737 (Visual interface)

## 🔧 Available Commands

### System Status
```bash
# Check if Archon system is running
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" health

# Get current workflow status  
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" status
```

### Agent OS Workflow (Spec-Driven Development)
```bash
# 1. Analyze current project
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" analyze --requirements "{{PROJECT_DESCRIPTION}}"

# 2. Create technical specification
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" spec --feature "{{FEATURE_DESCRIPTION}}"

# 3. Generate atomic tasks
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" tasks

# 4. Execute with 13 specialized agents
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" execute

# 5. Complete with quality validation
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" complete

# OR run full workflow at once
python "C:\Jarvis\AI Workspace\Archon\trigger_docker_agents.py" workflow --feature "{{FEATURE}}"
```

### Direct API Calls
```bash
# Agent system health
curl http://localhost:8052/health

# Workflow status
curl http://localhost:8052/agent-os/status

# Start workflow
curl -X POST http://localhost:8052/agent-os/workflow \
  -H "Content-Type: application/json" \
  -d '{"feature_description": "{{FEATURE}}", "user_requirements": "{{REQUIREMENTS}}"}'
```

## 🧠 Available Agents

The centralized Docker system provides 13 specialized agents:

- **document** - Documentation and technical writing
- **rag** - Knowledge retrieval and context search  
- **context** - Context analysis and management
- **product** - Product planning and requirements
- **builder** - Core development and implementation
- **security** - Security analysis and validation
- **testing** - Test creation and quality assurance
- **ux** - User experience and interface design
- **architect** - System architecture and design patterns
- **workflow** - Process orchestration and management
- **orchestrator** - Multi-agent coordination
- **automation** - CI/CD and automated processes
- **spec_workflow** - Specification-driven development

## 💾 Agent Memory System

All agents use persistent memory across sessions:
- **Conversation**: User preferences and interaction patterns
- **Learning**: Technical knowledge and discovered patterns  
- **Context**: Project-specific architecture and constraints
- **Findings**: Insights, recommendations, and optimizations

## 🎯 When to Use Archon Agents

**Use for complex tasks requiring:**
- Multi-agent coordination
- Quality validation and testing
- Architecture and security analysis
- Spec-driven development workflow
- Cross-session memory and learning

**Continue with Claude Code directly for:**
- Simple file edits
- Quick code fixes
- Exploratory development
- Rapid prototyping

## 🛠️ Setup for This Project

1. **Copy this file** to `.cursor/commands/archon_integration.md`
2. **Test connection**: Run health check command above
3. **Verify agents**: Check that all 13 agents are available
4. **Start using**: Reference this file with `@.cursor/commands/archon_integration.md`

## 🔄 Integration Workflow

```
Your Project (Claude Code) ──→ Commands ──→ Archon Docker System
                                           ├── 13 Specialized Agents
                                           ├── Agent Memory System  
                                           ├── Quality Validation
                                           └── Spec-Driven Workflow
```

## 🚨 Troubleshooting

**If commands fail:**
1. Check Docker containers are running: `docker ps`
2. Verify endpoints are accessible: `curl http://localhost:8052/health`
3. Check Archon system logs: `docker logs Archon-Agents`

**Service URLs:**
- All services run on localhost with different ports
- No authentication required for local development
- UI dashboard provides visual status monitoring

## 📚 Documentation

- Full integration guide: `C:\Jarvis\AI Workspace\Archon\CLAUDE-ARCHON.md`
- API documentation: Access UI at http://localhost:3737
- Agent OS workflow: `.agent-os/` documentation in Archon project