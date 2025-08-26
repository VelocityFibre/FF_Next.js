/**
 * FibreFlow Database Testing Runner
 * Executes comprehensive database testing suite
 */

import { DatabaseTestingSuite } from './database-testing-suite';
import { SchemaValidationSuite } from './schema-validation-suite';
import * as fs from 'fs';
import * as path from 'path';

interface TestReport {
  timestamp: string;
  environment: {
    node_version: string;
    database_urls: {
      firebase: boolean;
      neon: boolean;
    };
  };
  database_tests: any[];
  schema_validation: any[];
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    warnings: number;
    duration: number;
    health_score: number;
  };
  recommendations: string[];
}

class DatabaseTestRunner {
  private testReport: TestReport;

  constructor() {
    this.testReport = {
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        database_urls: {
          firebase: !!process.env.VITE_FIREBASE_PROJECT_ID,
          neon: !!process.env.VITE_NEON_DATABASE_URL
        }
      },
      database_tests: [],
      schema_validation: [],
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        duration: 0,
        health_score: 0
      },
      recommendations: []
    };
  }

  async runComprehensiveTests(): Promise<void> {
    console.log('🚀 FibreFlow Comprehensive Database Testing');
    console.log('==========================================\n');
    
    const startTime = Date.now();

    try {
      // Environment Check
      await this.checkEnvironment();
      
      // Run Database Tests
      console.log('📋 Phase 1: Database Operations Testing');
      console.log('======================================');
      const dbTesting = new DatabaseTestingSuite();
      await dbTesting.runAllTests();
      
      // Run Schema Validation
      console.log('\n📋 Phase 2: Schema Validation');
      console.log('============================');
      const schemaValidation = new SchemaValidationSuite();
      await schemaValidation.validateAllSchemas();
      
      // Generate Combined Report
      const totalDuration = Date.now() - startTime;
      await this.generateCombinedReport(totalDuration);
      
    } catch (error: any) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  private async checkEnvironment(): Promise<void> {
    console.log('🔍 Checking Environment Configuration...\n');
    
    // Check Node.js version
    console.log(`📦 Node.js Version: ${process.version}`);
    
    // Check environment variables
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID', 
      'VITE_NEON_DATABASE_URL'
    ];
    
    const missingVars: string[] = [];
    
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    });
    
    if (missingVars.length > 0) {
      console.log('⚠️ Missing Environment Variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n💡 Some tests may fail without proper configuration.\n');
    } else {
      console.log('✅ All required environment variables are set.\n');
    }

    // Check if running in development environment
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      console.log('🔧 Running in development mode - using development configurations.\n');
    }
  }

  private async generateCombinedReport(totalDuration: number): Promise<void> {
    console.log('\n📊 Generating Comprehensive Database Report');
    console.log('==========================================\n');

    // Calculate summary statistics
    this.testReport.summary.duration = totalDuration;
    this.testReport.summary.total_tests = this.testReport.database_tests.length + this.testReport.schema_validation.length;
    
    // Generate recommendations based on findings
    this.generateRecommendations();
    
    // Calculate health score
    const healthScore = this.calculateHealthScore();
    this.testReport.summary.health_score = healthScore;
    
    // Display summary
    this.displaySummary();
    
    // Save report to file
    await this.saveReportToFile();
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // Performance recommendations
    if (this.testReport.summary.duration > 30000) {
      recommendations.push('Database operations are slow - consider connection pooling optimization');
    }

    // Security recommendations
    if (!this.testReport.environment.database_urls.firebase || !this.testReport.environment.database_urls.neon) {
      recommendations.push('Ensure all database connections are properly configured');
    }

    // General recommendations
    recommendations.push('Schedule regular database health checks');
    recommendations.push('Implement automated backup verification');
    recommendations.push('Monitor database performance metrics in production');
    recommendations.push('Set up alerting for database connection failures');
    
    // Development recommendations
    recommendations.push('Consider implementing database seeding for consistent test data');
    recommendations.push('Add automated tests to CI/CD pipeline');

    this.testReport.recommendations = recommendations;
  }

  private calculateHealthScore(): number {
    const { passed, failed, warnings, total_tests } = this.testReport.summary;
    
    if (total_tests === 0) return 0;
    
    // Health score calculation:
    // - Passed tests: 100% weight
    // - Warnings: 70% weight  
    // - Failed tests: 0% weight
    const score = ((passed + (warnings * 0.7)) / total_tests) * 100;
    return Math.round(score);
  }

  private displaySummary(): void {
    const { total_tests, passed, failed, warnings, duration, health_score } = this.testReport.summary;
    
    console.log('📈 Final Summary:');
    console.log(`  🎯 Health Score: ${health_score}%`);
    console.log(`  📊 Total Tests: ${total_tests}`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⚠️ Warnings: ${warnings}`);
    console.log(`  ⏱️ Total Duration: ${Math.round(duration / 1000)}s`);
    
    // Health assessment
    console.log('\n🏥 Database Health Assessment:');
    if (health_score >= 90) {
      console.log('  🟢 Excellent - Database is production ready');
    } else if (health_score >= 70) {
      console.log('  🟡 Good - Minor issues to address');
    } else if (health_score >= 50) {
      console.log('  🟠 Fair - Several issues need attention');
    } else {
      console.log('  🔴 Poor - Critical issues must be resolved');
    }

    // Key recommendations
    console.log('\n💡 Key Recommendations:');
    this.testReport.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  private async saveReportToFile(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-test-report-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'reports', filename);
    
    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save detailed report
    fs.writeFileSync(filepath, JSON.stringify(this.testReport, null, 2));
    
    // Also save a simple summary report
    const summaryFilepath = path.join(process.cwd(), 'reports', 'latest-database-health.json');
    const summary = {
      timestamp: this.testReport.timestamp,
      health_score: this.testReport.summary.health_score,
      status: this.testReport.summary.failed === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      summary: this.testReport.summary,
      top_recommendations: this.testReport.recommendations.slice(0, 3)
    };
    
    fs.writeFileSync(summaryFilepath, JSON.stringify(summary, null, 2));
    
    console.log(`\n📄 Detailed Report: ${filepath}`);
    console.log(`📄 Summary Report: ${summaryFilepath}`);
  }
}

// Execute tests if run directly
if (require.main === module) {
  const testRunner = new DatabaseTestRunner();
  testRunner.runComprehensiveTests()
    .then(() => {
      console.log('\n✅ Database testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database testing failed:', error);
      process.exit(1);
    });
}

export { DatabaseTestRunner };