
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
#!/usr/bin/env node

/**
 * FibreFlow React Application - UI/UX Diagnostic Tool
 * 
 * This script performs comprehensive checks to identify UI/UX issues
 * after the Neon database migration.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class UIHIssuesDiagnostics {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
        this.startTime = Date.now();
    }

    log(level, message, details = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, details };
        
        switch (level) {
            case 'ERROR':
                this.issues.push(logEntry);
                console.error(`❌ [${timestamp}] ${message}`);
                break;
            case 'WARNING':
                this.warnings.push(logEntry);
                console.warn(`⚠️  [${timestamp}] ${message}`);
                break;
            case 'SUCCESS':
                this.successes.push(logEntry);
                console.log(`✅ [${timestamp}] ${message}`);
                break;
            case 'INFO':
                console.log(`ℹ️  [${timestamp}] ${message}`);
                break;
        }

        if (details) {
            console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
        }
    }

    async checkApplicationServer() {
        this.log('INFO', 'Checking if application server is running on port 5176...');
        
        try {
            const { execSync } = require('child_process');
            const result = execSync('netstat -an | findstr 5176', { encoding: 'utf8' });
            
            if (result.includes('LISTENING')) {
                this.log('SUCCESS', 'Application server is running on port 5176');
                return true;
            } else {
                this.log('ERROR', 'Application server is not running on port 5176');
                return false;
            }
        } catch (error) {
            this.log('ERROR', 'Failed to check server status', error.message);
            return false;
        }
    }

    async checkTypeScriptErrors() {
        this.log('INFO', 'Checking for TypeScript compilation errors...');
        
        try {
            execSync('npx tsc --noEmit --skipLibCheck', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            this.log('SUCCESS', 'No TypeScript compilation errors found');
        } catch (error) {
            const errorOutput = error.stdout || error.stderr || error.message;
            const errorLines = errorOutput.split('\n').filter(line => line.trim());
            
            this.log('ERROR', `Found ${errorLines.length} TypeScript errors`, {
                errors: errorLines.slice(0, 10) // Show first 10 errors
            });
        }
    }

    async checkBuildSuccess() {
        this.log('INFO', 'Testing if application builds successfully...');
        
        try {
            const buildOutput = execSync('npm run build', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            if (buildOutput.includes('built in')) {
                this.log('SUCCESS', 'Application builds successfully');
            } else {
                this.log('WARNING', 'Build completed with warnings');
            }
        } catch (error) {
            this.log('ERROR', 'Application build failed', error.message);
        }
    }

    async checkDatabaseConnection() {
        this.log('INFO', 'Testing database connection...');
        
        try {
            const testScript = `
                const { neon } = require('@neondatabase/serverless');
                const url = process.env.VITE_NEON_DATABASE_URL || 'process.env.DATABASE_URL';
                const sql = neon(url);
                
                (async () => {
                    try {
                        const result = await sql\`SELECT NOW() as current_time, 'test' as message\`;
                        console.log('DATABASE_CONNECTION_SUCCESS', JSON.stringify(result[0]));
                    } catch (error) {
                        console.error('DATABASE_CONNECTION_ERROR', error.message);
                        process.exit(1);
                    }
                })();
            `;
            
            const result = execSync(`node -e "${testScript}"`, { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            if (result.includes('DATABASE_CONNECTION_SUCCESS')) {
                this.log('SUCCESS', 'Database connection is working');
            } else {
                this.log('ERROR', 'Database connection test failed');
            }
        } catch (error) {
            this.log('ERROR', 'Database connection error', error.message);
        }
    }

    async checkEssentialFiles() {
        this.log('INFO', 'Checking for essential files...');
        
        const essentialFiles = [
            'src/App.tsx',
            'src/main.tsx',
            'src/app/router/index.tsx',
            'src/contexts/AuthContext.tsx',
            'src/contexts/ProjectContext.tsx',
            'src/lib/neon.ts',
            '.env'
        ];
        
        let missingFiles = [];
        
        for (const file of essentialFiles) {
            if (fs.existsSync(file)) {
                this.log('SUCCESS', `Essential file exists: ${file}`);
            } else {
                this.log('ERROR', `Missing essential file: ${file}`);
                missingFiles.push(file);
            }
        }
        
        return missingFiles.length === 0;
    }

    async checkEnvironmentVariables() {
        this.log('INFO', 'Checking environment variables...');
        
        // Read .env file
        const envPath = '.env';
        if (!fs.existsSync(envPath)) {
            this.log('ERROR', '.env file not found');
            return false;
        }
        
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = [
            'VITE_FIREBASE_API_KEY',
            'VITE_FIREBASE_PROJECT_ID',
            'VITE_NEON_DATABASE_URL',
            'DATABASE_URL'
        ];
        
        let missingVars = [];
        
        for (const varName of requiredVars) {
            if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
                this.log('SUCCESS', `Environment variable set: ${varName}`);
            } else {
                this.log('WARNING', `Environment variable missing or placeholder: ${varName}`);
                missingVars.push(varName);
            }
        }
        
        return missingVars.length === 0;
    }

    async checkConsoleLogStatements() {
        this.log('INFO', 'Checking for console.log statements in source code...');
        
        try {
            const grepResult = execSync('grep -r "console\\." src/ --include="*.ts" --include="*.tsx"', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            const logStatements = grepResult.split('\n').filter(line => line.trim());
            
            if (logStatements.length > 0) {
                this.log('WARNING', `Found ${logStatements.length} console.* statements`, {
                    statements: logStatements.slice(0, 5) // Show first 5
                });
            } else {
                this.log('SUCCESS', 'No console.log statements found');
            }
        } catch (error) {
            // grep returns exit code 1 when no matches found
            if (error.status === 1) {
                this.log('SUCCESS', 'No console.log statements found');
            } else {
                this.log('WARNING', 'Could not check for console.log statements', error.message);
            }
        }
    }

    async checkImportErrors() {
        this.log('INFO', 'Checking for common import errors...');
        
        try {
            const patterns = [
                { pattern: 'import.*from.*undefined', description: 'Undefined imports' },
                { pattern: 'import.*from.*null', description: 'Null imports' },
                { pattern: 'Cannot find module', description: 'Missing modules' }
            ];
            
            for (const { pattern, description } of patterns) {
                try {
                    const result = execSync(`grep -r "${pattern}" src/ --include="*.ts" --include="*.tsx"`, { 
                        encoding: 'utf8',
                        cwd: process.cwd()
                    });
                    
                    if (result.trim()) {
                        this.log('WARNING', `Found ${description}`, result.split('\n').slice(0, 3));
                    }
                } catch (grepError) {
                    // No matches found (exit code 1) is expected and good
                }
            }
            
            this.log('SUCCESS', 'Import check completed');
        } catch (error) {
            this.log('WARNING', 'Could not complete import error check', error.message);
        }
    }

    async checkRouterConfiguration() {
        this.log('INFO', 'Checking router configuration...');
        
        const routerPath = 'src/app/router/index.tsx';
        
        if (!fs.existsSync(routerPath)) {
            this.log('ERROR', 'Router file not found');
            return false;
        }
        
        const routerContent = fs.readFileSync(routerPath, 'utf8');
        
        // Check for common router issues
        const checks = [
            { 
                pattern: /createBrowserRouter/,
                message: 'Browser router is configured',
                type: 'SUCCESS'
            },
            { 
                pattern: /Navigate.*to.*\/app\/dashboard/,
                message: 'Default redirect to dashboard is configured',
                type: 'SUCCESS'
            },
            { 
                pattern: /ProtectedRoute/,
                message: 'Protected routes are configured',
                type: 'SUCCESS'
            },
            { 
                pattern: /ErrorBoundary/,
                message: 'Error boundary is configured',
                type: 'SUCCESS'
            }
        ];
        
        for (const check of checks) {
            if (check.pattern.test(routerContent)) {
                this.log(check.type, check.message);
            } else {
                this.log('WARNING', `Missing: ${check.message}`);
            }
        }
        
        return true;
    }

    async checkAuthenticationSetup() {
        this.log('INFO', 'Checking authentication setup...');
        
        const authContextPath = 'src/contexts/AuthContext.tsx';
        
        if (!fs.existsSync(authContextPath)) {
            this.log('ERROR', 'AuthContext file not found');
            return false;
        }
        
        const authContent = fs.readFileSync(authContextPath, 'utf8');
        
        // Check if in development mode (mocked auth)
        if (authContent.includes('DEVELOPMENT MODE')) {
            this.log('SUCCESS', 'Authentication is in development mode (mocked)');
            this.log('INFO', 'This allows bypassing authentication during development');
        } else {
            this.log('WARNING', 'Authentication appears to be in production mode');
        }
        
        return true;
    }

    async performHttpHealthCheck() {
        this.log('INFO', 'Performing HTTP health check...');
        
        try {
            // Use curl to test the application
            const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5176', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            const httpCode = parseInt(response.trim());
            
            if (httpCode === 200) {
                this.log('SUCCESS', 'Application responds with HTTP 200');
            } else if (httpCode >= 300 && httpCode < 400) {
                this.log('WARNING', `Application redirects with HTTP ${httpCode}`);
            } else {
                this.log('ERROR', `Application responds with HTTP ${httpCode}`);
            }
            
            return httpCode === 200;
        } catch (error) {
            this.log('ERROR', 'HTTP health check failed', error.message);
            return false;
        }
    }

    async generateDiagnosticReport() {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(60));
        console.log('🔍 FIBREFLOW UI/UX DIAGNOSTIC REPORT');
        console.log('='.repeat(60));
        console.log(`📊 Diagnosis completed in ${duration} seconds`);
        console.log(`✅ Successes: ${this.successes.length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        console.log(`❌ Issues: ${this.issues.length}\n`);
        
        if (this.issues.length > 0) {
            console.log('🚨 CRITICAL ISSUES FOUND:');
            console.log('-'.repeat(40));
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.message}`);
                if (issue.details) {
                    console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`);
                }
            });
            console.log('');
        }
        
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS TO ADDRESS:');
            console.log('-'.repeat(40));
            this.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.message}`);
            });
            console.log('');
        }
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Save report to file
        this.saveReportToFile();
        
        return {
            issues: this.issues.length,
            warnings: this.warnings.length,
            successes: this.successes.length,
            duration
        };
    }

    generateRecommendations() {
        console.log('💡 RECOMMENDATIONS:');
        console.log('-'.repeat(40));
        
        if (this.issues.length === 0 && this.warnings.length === 0) {
            console.log('🎉 No major issues found! Your application appears to be running correctly.');
        } else {
            if (this.issues.some(i => i.message.includes('TypeScript'))) {
                console.log('1. Fix TypeScript errors by running: npx tsc --noEmit');
            }
            
            if (this.issues.some(i => i.message.includes('server'))) {
                console.log('2. Start the development server with: npm run dev');
            }
            
            if (this.issues.some(i => i.message.includes('database'))) {
                console.log('3. Check your database connection and environment variables');
            }
            
            if (this.warnings.some(w => w.message.includes('console'))) {
                console.log('4. Remove console.log statements from production code');
            }
            
            console.log('5. Open http://localhost:5176 in your browser to test the UI');
            console.log('6. Open browser developer tools to check for JavaScript errors');
            console.log('7. Use the debug-ui.html tool for advanced browser-based diagnostics');
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('-'.repeat(40));
        console.log('1. Open the debug-ui.html file in your browser for interactive testing');
        console.log('2. Check browser console for JavaScript errors');
        console.log('3. Verify that key pages load correctly (dashboard, projects, etc.)');
        console.log('4. Test user workflows (navigation, form submissions, etc.)');
        console.log('');
    }

    saveReportToFile() {
        const reportData = {
            timestamp: new Date().toISOString(),
            duration: ((Date.now() - this.startTime) / 1000).toFixed(2) + 's',
            summary: {
                issues: this.issues.length,
                warnings: this.warnings.length,
                successes: this.successes.length
            },
            issues: this.issues,
            warnings: this.warnings,
            successes: this.successes
        };
        
        const reportPath = `diagnostic-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }

    async runFullDiagnostic() {
        console.log('🚀 Starting FibreFlow UI/UX Diagnostic...\n');
        
        await this.checkApplicationServer();
        await this.checkEssentialFiles();
        await this.checkEnvironmentVariables();
        await this.checkTypeScriptErrors();
        await this.checkDatabaseConnection();
        await this.checkRouterConfiguration();
        await this.checkAuthenticationSetup();
        await this.checkConsoleLogStatements();
        await this.checkImportErrors();
        await this.performHttpHealthCheck();
        
        return await this.generateDiagnosticReport();
    }
}

// Run the diagnostic if this file is executed directly
if (require.main === module) {
    const diagnostic = new UIHIssuesDiagnostics();
    
    diagnostic.runFullDiagnostic()
        .then(result => {
            process.exit(result.issues > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Diagnostic failed:', error);
            process.exit(1);
        });
}

module.exports = UIHIssuesDiagnostics;