# FibreFlow Development Tools

This directory contains all development, testing, and documentation tools for the FibreFlow React application.

## 📁 Directory Structure

```
dev-tools/
├── automation/          # Development automation scripts and tools
│   ├── docker_agent_*.py  # Docker agent management scripts
│   ├── trigger_docker_agents.py  # Agent orchestration
│   ├── CLAUDE_INIT.py     # Claude development initialization
│   └── *.py               # Other automation utilities
│
├── documentation/       # Project documentation and guides
│   ├── *.md              # Markdown documentation files
│   ├── HANDOVER_*.md     # Project handover documents
│   ├── Uploads/          # Sample data files for testing
│   ├── Images/           # Documentation screenshots
│   └── *.json            # Configuration and metadata files
│
├── testing/            # Testing files and configurations
│   ├── tests/           # Playwright E2E test files
│   │   ├── e2e/         # End-to-end test specifications
│   │   ├── global-*.ts  # Test setup and teardown
│   │   └── *.md         # Manual testing documentation
│   └── test-results/    # Test execution results and reports
│
└── assets/             # Development assets and media
    ├── screenshots/     # Application screenshots
    ├── *.png           # Test images and captures
    └── test-*.js       # Browser testing scripts
```

## 🚀 Key Scripts and Tools

### Automation Scripts
- **`trigger_docker_agents.py`** - Main orchestration for Docker agents
- **`CLAUDE_INIT.py`** - Initialize Claude development environment
- **`docker_agent_enforcer.py`** - Enforce Docker agent compliance
- **`archon_sync.py`** - Synchronize with Archon project management

### Testing
- **E2E Tests**: Located in `testing/tests/e2e/`
- **Test Configuration**: See root `playwright.config.ts`
- **Manual Tests**: Browser automation scripts in `assets/`

### Documentation
- **Migration Guides**: Step-by-step Angular to React migration
- **API Documentation**: Service and component specifications  
- **Handover Documents**: Project state and progress tracking
- **Sample Data**: Excel and CSV files for development/testing

## 📝 Usage

### Running Tests
```bash
# From project root
npm run test:e2e

# Specific test file
npm run test:e2e -- tests/e2e/dashboard.spec.ts
```

### Docker Agents
```bash
# Trigger agent analysis
python dev-tools/automation/trigger_docker_agents.py analyze --requirements "description"

# Check agent health
python dev-tools/automation/docker_agent_enforcer.py status
```

### Documentation Access
All documentation is available in `dev-tools/documentation/`:
- **`README.md`** - Main project documentation
- **`REACT_MIGRATION_MASTER_PLAN.md`** - Complete migration strategy
- **`MODULE_SPECIFICATIONS.md`** - Detailed module requirements

## 🔧 Configuration

The development tools are configured to work seamlessly with:
- **Claude Code** - AI development assistant
- **Playwright** - E2E testing framework
- **Docker Agents** - Automated development assistance
- **Firebase** - Backend services and deployment

## 📊 File Organization Benefits

1. **Clean Root Directory** - Only production files in project root
2. **Easy Access** - All dev tools in predictable locations
3. **Maintainable** - Clear separation of concerns
4. **Claude-Friendly** - Tools remain accessible to AI assistants
5. **Developer-Friendly** - Logical structure for human developers

## 🚀 Integration

This structure maintains full compatibility with:
- VS Code extensions and Claude Code
- NPM scripts and build processes
- CI/CD pipelines and deployment
- Git workflows and version control
- Docker containerization

All tools and scripts continue to function as before, with paths updated accordingly.