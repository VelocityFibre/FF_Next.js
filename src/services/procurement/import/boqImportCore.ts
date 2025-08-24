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
import { 
  ImportJob,
  ImportConfig, 
  ProgressCallback, 
  ImportStats,
  BOQImportJobManager,
  BOQImportCatalogManager,
  BOQImportDataProcessor,
  BOQImportProcessor,
  BOQImportDatabaseSaver,
  BOQImportStatsCalculator
} from './core';

/**
 * BOQ Import Core Service
 * @deprecated Use individual services from './core' instead
 */
export class BOQImportCore {
  private jobManager: BOQImportJobManager;
  private catalogManager: BOQImportCatalogManager;
  private dataProcessor: BOQImportDataProcessor;
  private processor: BOQImportProcessor;
  private databaseSaver: BOQImportDatabaseSaver;
  private statsCalculator: BOQImportStatsCalculator;

  constructor() {
    this.jobManager = new BOQImportJobManager();
    this.catalogManager = new BOQImportCatalogManager();
    this.dataProcessor = new BOQImportDataProcessor(this.catalogManager);
    this.databaseSaver = new BOQImportDatabaseSaver();
    this.processor = new BOQImportProcessor(
      this.jobManager,
      this.catalogManager,
      this.dataProcessor,
      this.databaseSaver
    );
    this.statsCalculator = new BOQImportStatsCalculator(this.jobManager);
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
    this.processor.processImport(job, file, context, fullConfig, onProgress).catch(error => {
      this.jobManager.updateProgress(job.id, 'failed', 100, error.message);
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
export { BOQImportProcessor as default } from './core';