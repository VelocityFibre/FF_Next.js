# FibreFlow React - Project Structure

## 📁 Clean Root Directory

The project root now contains only production-critical files and folders:

```
FibreFlow_React/
├── 📁 src/                    # Application source code
├── 📁 public/                 # Static assets
├── 📁 scripts/                # Database and build scripts
├── 📁 functions/              # Firebase cloud functions
├── 📁 dist/                   # Production build output
├── 📁 node_modules/           # Dependencies
├── 📁 dev-tools/              # 🆕 Development tools (organized)
├── 📁 docs/                   # 📝 Only sample data files remain
├── 🔧 package.json            # Project configuration
├── 🔧 tsconfig.json           # TypeScript configuration
├── 🔧 vite.config.ts          # Vite build configuration
├── 🔧 tailwind.config.js      # Tailwind CSS configuration
├── 🔧 playwright.config.ts    # E2E testing configuration
├── 🔧 firebase.json           # Firebase deployment configuration
├── 🔧 firestore.rules         # Firestore security rules
├── 🔧 drizzle.config.ts       # Database ORM configuration
└── 🔧 neon-mcp-config.json    # Neon database configuration
```

## 🛠️ Development Tools Organization

All development, testing, and documentation tools are now organized in `dev-tools/`:

### `dev-tools/automation/`
Development automation scripts and Docker agent management:
- `trigger_docker_agents.py` - Main Docker agent orchestration
- `CLAUDE_INIT.py` - Claude development environment initialization
- `docker_agent_enforcer.py` - Agent compliance enforcement
- `archon_sync.py` - Archon project management sync
- `refactor_large_files.py` - Code refactoring utilities
- `fix-runtime-errors.py` - Error resolution automation

### `dev-tools/documentation/`
Project documentation, guides, and metadata:
- `README.md` - Main project documentation
- `REACT_MIGRATION_MASTER_PLAN.md` - Complete migration strategy
- `MODULE_SPECIFICATIONS.md` - Detailed module requirements
- `HANDOVER_*.md` - Project handover documents
- `RULES.md` - Development standards and guardrails
- `*.json` - Configuration and metadata files
- `Uploads/` - Sample data files for development/testing
- `Images/` - Documentation screenshots

### `dev-tools/testing/`
Testing configurations, test files, and results:
- `tests/e2e/` - Playwright end-to-end test specifications
- `tests/global-*.ts` - Test setup and teardown scripts
- `tests/manual-*.md` - Manual testing documentation
- `test-results/` - Test execution results and reports

### `dev-tools/assets/`
Development assets, screenshots, and test media:
- `screenshots/` - Application state screenshots
- `*.png` - Test images and visual captures
- `test-*.js` - Browser automation testing scripts

## 🎯 Benefits of Organization

### 1. **Clean Root Directory**
- Only production files in project root
- Easier navigation for developers
- Cleaner repository structure
- Better separation of concerns

### 2. **Maintainable Development Tools**
- All dev tools in predictable locations
- Easy to find automation scripts
- Organized documentation
- Centralized testing resources

### 3. **Claude Code Compatibility**
- Tools remain accessible to AI assistants
- Paths updated in configuration files
- No disruption to development workflow
- Enhanced AI assistant navigation

### 4. **Developer Experience**
- Logical folder structure
- Clear separation of production vs development
- Easy onboarding for new developers
- Consistent organization patterns

### 5. **CI/CD Friendly**
- Build processes unaffected
- Testing configurations preserved
- Deployment scripts maintained
- Docker integration intact

## 🔧 Configuration Updates

Updated configuration files to reflect new structure:

### `playwright.config.ts`
```typescript
testDir: './dev-tools/testing/tests/e2e'
outputDir: 'dev-tools/testing/test-results/'
globalSetup: './dev-tools/testing/tests/global-setup.ts'
```

### Path Compatibility
All existing npm scripts and build processes continue to work:
- `npm run test:e2e` - E2E testing
- `npm run build` - Production build
- `npm run dev` - Development server
- `npm run type-check` - TypeScript validation

## 📚 Quick Access Guide

### For Developers
- **Source Code**: `src/`
- **Documentation**: `dev-tools/documentation/`
- **Testing**: `dev-tools/testing/`
- **Scripts**: `scripts/` and `dev-tools/automation/`

### For AI Assistants (Claude Code)
- **Development Tools**: `dev-tools/automation/`
- **Project Context**: `dev-tools/documentation/`
- **Test Files**: `dev-tools/testing/tests/`
- **Sample Data**: `dev-tools/documentation/Uploads/`

### For CI/CD Systems
- **Build Config**: Root configuration files
- **Test Config**: `playwright.config.ts`
- **Deployment**: `firebase.json`, `dist/`
- **Scripts**: `scripts/`, `package.json`

## 🚀 Next Steps

The organized structure is now ready for:
1. **Continued Development** - All tools accessible and functional
2. **Team Collaboration** - Clear structure for multiple developers
3. **CI/CD Integration** - Build and deployment processes unchanged
4. **Documentation Updates** - Centralized and organized
5. **Testing Expansion** - Structured testing framework in place

This organization maintains full compatibility while providing a clean, maintainable structure for the FibreFlow React application.