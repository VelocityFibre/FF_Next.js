/**
 * BOQ Import Core Service - Legacy Compatibility Layer
 * @deprecated Use './core' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './core' directly
 */

// Re-export everything from the modular structure
export * from './core';

// Import services for legacy class compatibility
import { validateFile } from '@/lib/utils/excelParser';
import { ProcurementContext } from '@/types/procurement/base.types';
// Import types from types file
import type { 
  ImportJob,
  ImportConfig, 
  ProgressCallback, 
  ImportStats
} from './core/types';

// Import classes directly from individual files
import { BOQImportJobManager as CoreJobManager } from './core/jobManager';
import { BOQImportCatalogManager as CoreCatalogManager } from './core/catalogManager';
import { BOQImportDataProcessor as CoreDataProcessor } from './core/dataProcessor';
import { BOQImportProcessor as CoreImportProcessor } from './core/importProcessor';
import { BOQImportDatabaseSaver as CoreDatabaseSaver } from './core/databaseSaver';
import { BOQImportStatsCalculator as CoreStatsCalculator } from './core/statsCalculator';

// Export types for external use
export type { 
  ImportJob,
  ImportConfig, 
  ProgressCallback, 
  ImportStats
};

// Re-export the actual implementations
export { 
  BOQImportJobManager 
} from './core/jobManager';
export { 
  BOQImportCatalogManager 
} from './core/catalogManager';
export { 
  BOQImportDataProcessor 
} from './core/dataProcessor';
export { 
  BOQImportProcessor 
} from './core/importProcessor';
export { 
  BOQImportDatabaseSaver 
} from './core/databaseSaver';
export { 
  BOQImportStatsCalculator 
} from './core/statsCalculator';

/**
 * BOQ Import Core Service
 * @deprecated Use individual services from './core' instead
 */
export class BOQImportCore {
  private jobManager: CoreJobManager;
  private catalogManager: CoreCatalogManager;
  private dataProcessor: CoreDataProcessor;
  private processor: CoreImportProcessor;
  private databaseSaver: CoreDatabaseSaver;
  private statsCalculator: CoreStatsCalculator;

  constructor() {
    this.jobManager = new CoreJobManager();
    this.catalogManager = new CoreCatalogManager();
    this.dataProcessor = new CoreDataProcessor(this.catalogManager);
    this.databaseSaver = new CoreDatabaseSaver();
    this.processor = new CoreImportProcessor(
      this.jobManager,
      this.dataProcessor,
      this.databaseSaver
    );
    this.statsCalculator = new CoreStatsCalculator(this.jobManager);
  }

  /**
   * Start BOQ import process
   * @deprecated Use BOQImportProcessor directly instead
   */
  async startImport(
    file: File,
    context: ProcurementContext,
    config: Partial<ImportConfig> = {},
    onProgress?: ProgressCallback
  ): Promise<string> {
    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      throw new Error(fileValidation.error);
    }

    // Create job
    const job = this.jobManager.createJob(file);

    // Full config with defaults
    const fullConfig: ImportConfig = {
      autoApprove: false,
      strictValidation: false,
      minMappingConfidence: 0.8,
      createNewItems: false,
      duplicateHandling: 'skip',
      ...config
    };

    // Start processing in background
    this.processor.processImport(job, file, context, fullConfig, onProgress).catch((error: Error) => {
      // Update job status to failed
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
      this.jobManager.updateJob(job);
      onProgress?.(job, 'failed', 100, error.message);
    });

    return job.id;
  }

  /**
   * Get import job status
   * @deprecated Use BOQImportJobManager.getJob() instead
   */
  getJobStatus(jobId: string): ImportJob | undefined {
    return this.jobManager.getJob(jobId);
  }

  /**
   * Cancel import job
   * @deprecated Use BOQImportJobManager.cancelJob() instead
   */
  cancelJob(jobId: string): boolean {
    return this.jobManager.cancelJob(jobId);
  }

  /**
   * Get import statistics
   * @deprecated Use BOQImportStatsCalculator.getImportStats() instead
   */
  getStats(): ImportStats {
    return this.statsCalculator.getImportStats();
  }

  /**
   * Alias for getStats() - for backward compatibility
   * @deprecated Use BOQImportStatsCalculator.getImportStats() instead
   */
  getImportStats(): ImportStats {
    return this.getStats();
  }

  /**
   * Get active import jobs
   * @deprecated Use BOQImportJobManager.getActiveJobs() instead
   */
  getActiveJobs(): ImportJob[] {
    return this.jobManager.getActiveJobs();
  }
}

// Default export for backward compatibility
export { BOQImportCore as default };