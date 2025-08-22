/**
 * BOQ Import Service
 * Handles the complete BOQ import workflow with progress tracking
 */

import { z } from 'zod';
import { parseFile, validateFile, ParseResult, ParsedBOQItem } from '@/lib/utils/excelParser';
import { 
  CatalogMatcher, 
  CatalogItem, 
  MatchResult, 
  MappingException,
  BOQItemForMatching 
} from '@/lib/utils/catalogMatcher';
import { procurementApiService } from './procurementApiService';
import { ProcurementContext } from '@/types/procurement/base.types';

// Import job status
export type ImportJobStatus = 
  | 'queued'
  | 'parsing'
  | 'mapping'
  | 'validating'
  | 'saving'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Import job
export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  progress: number; // 0-100
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: {
    totalRows: number;
    processedRows: number;
    validRows: number;
    skippedRows: number;
    autoMappedItems: number;
    exceptionsCount: number;
    parseTime: number;
    mappingTime: number;
    saveTime: number;
  };
  result?: {
    boqId: string;
    itemsCreated: number;
    exceptionsCreated: number;
  };
}

// Import configuration
export interface ImportConfig {
  autoApprove: boolean; // Auto-approve BOQ if confidence is high
  strictValidation: boolean; // Use strict validation mode
  minMappingConfidence: number; // Minimum confidence for auto-mapping
  createNewItems: boolean; // Create new catalog items for unmapped items
  duplicateHandling: 'skip' | 'update' | 'create_new';
  headerRow?: number;
  skipRows?: number;
  columnMapping?: Record<string, string>;
}

// Progress callback type
export type ProgressCallback = (
  job: ImportJob,
  stage: string,
  progress: number,
  message?: string
) => void;

// Import statistics
export interface ImportStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  totalItemsImported: number;
  averageMappingConfidence: number;
  topFailureReasons: { reason: string; count: number }[];
}

export class BOQImportService {
  private activeJobs = new Map<string, ImportJob>();
  private jobHistory: ImportJob[] = [];
  private catalogMatcher?: CatalogMatcher;
  private catalogItems: CatalogItem[] = [];

  constructor() {
    this.loadCatalogItems();
  }

  /**
   * Load catalog items and initialize matcher
   */
  private async loadCatalogItems(): Promise<void> {
    try {
      // TODO: Replace with actual catalog service call
      this.catalogItems = await this.fetchCatalogItems();
      this.catalogMatcher = new CatalogMatcher(this.catalogItems, {
        minConfidence: 0.6,
        maxResults: 5,
        enableFuzzyMatching: true,
        enableKeywordMatching: true
      });
    } catch (error) {
      console.error('Failed to load catalog items:', error);
      this.catalogItems = [];
    }
  }

  /**
   * Fetch catalog items from API
   */
  private async fetchCatalogItems(): Promise<CatalogItem[]> {
    // Mock implementation - replace with actual API call
    return [
      {
        id: 'cat-001',
        code: 'FBC-50-SM',
        description: 'Fiber Optic Cable, Single Mode, 50 Core',
        category: 'Cables',
        subcategory: 'Fiber Optic',
        uom: 'meter',
        status: 'active',
        keywords: ['fiber', 'optical', 'cable', 'singlemode'],
        aliases: ['Fiber Cable 50 Core', 'SM Fiber 50C']
      },
      {
        id: 'cat-002',
        code: 'ECC-4C-16',
        description: 'Electrical Control Cable, 4 Core, 16mm',
        category: 'Cables',
        subcategory: 'Electrical',
        uom: 'meter',
        status: 'active',
        keywords: ['electrical', 'control', 'cable', '4core'],
        aliases: ['Control Cable 4C', 'EC Cable 16mm']
      },
      {
        id: 'cat-003',
        code: 'FTJ-SC-12',
        description: 'Fiber Termination Joint, SC Connector, 12 Port',
        category: 'Terminations',
        subcategory: 'Fiber Optic',
        uom: 'each',
        status: 'active',
        keywords: ['fiber', 'termination', 'joint', 'connector', 'sc'],
        aliases: ['SC Termination 12P', 'Fiber Joint SC']
      }
    ];
  }

  /**
   * Start BOQ import process
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

    // Create import job
    const job: ImportJob = {
      id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      metadata: {
        totalRows: 0,
        processedRows: 0,
        validRows: 0,
        skippedRows: 0,
        autoMappedItems: 0,
        exceptionsCount: 0,
        parseTime: 0,
        mappingTime: 0,
        saveTime: 0
      }
    };

    this.activeJobs.set(job.id, job);

    // Start processing in background
    this.processImport(job, file, context, config, onProgress).catch(error => {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
      onProgress?.(job, 'failed', 100, error.message);
    });

    return job.id;
  }

  /**
   * Process import job
   */
  private async processImport(
    job: ImportJob,
    file: File,
    context: ProcurementContext,
    config: Partial<ImportConfig>,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const fullConfig: ImportConfig = {
      autoApprove: false,
      strictValidation: false,
      minMappingConfidence: 0.8,
      createNewItems: false,
      duplicateHandling: 'skip',
      ...config
    };

    try {
      job.status = 'parsing';
      job.startedAt = new Date();
      this.updateProgress(job, 'parsing', 5, 'Parsing Excel file...', onProgress);

      // Stage 1: Parse file
      const parseStart = Date.now();
      const parseResult = await parseFile(file, {
        headerRow: fullConfig.headerRow,
        skipRows: fullConfig.skipRows,
        columnMapping: fullConfig.columnMapping,
        strictValidation: fullConfig.strictValidation
      }, (progress) => {
        this.updateProgress(job, 'parsing', 5 + (progress * 25), 'Parsing file...', onProgress);
      });

      job.metadata.parseTime = Date.now() - parseStart;
      job.metadata.totalRows = parseResult.metadata.totalRows;
      job.metadata.processedRows = parseResult.metadata.processedRows;
      job.metadata.validRows = parseResult.metadata.validRows;
      job.metadata.skippedRows = parseResult.metadata.skippedRows;

      if (parseResult.errors.length > 0 && parseResult.items.length === 0) {
        throw new Error(`Parse failed: ${parseResult.errors[0].message}`);
      }

      this.updateProgress(job, 'mapping', 30, 'Mapping catalog items...', onProgress);

      // Stage 2: Map catalog items
      const mappingStart = Date.now();
      const mappingResult = await this.performCatalogMapping(
        parseResult.items,
        fullConfig,
        (progress) => {
          this.updateProgress(job, 'mapping', 30 + (progress * 40), 'Mapping items...', onProgress);
        }
      );

      job.metadata.mappingTime = Date.now() - mappingStart;
      job.metadata.autoMappedItems = mappingResult.stats.autoMapped;
      job.metadata.exceptionsCount = mappingResult.exceptions.length;

      this.updateProgress(job, 'validating', 70, 'Validating data...', onProgress);

      // Stage 3: Validate and prepare for save
      const validatedItems = await this.validateImportItems(
        parseResult.items,
        mappingResult,
        fullConfig
      );

      this.updateProgress(job, 'saving', 80, 'Saving BOQ...', onProgress);

      // Stage 4: Save to database
      const saveStart = Date.now();
      const boqResult = await this.saveBOQ(
        validatedItems,
        mappingResult.exceptions,
        context,
        fullConfig,
        parseResult
      );

      job.metadata.saveTime = Date.now() - saveStart;

      // Complete job
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.result = {
        boqId: boqResult.boqId,
        itemsCreated: boqResult.itemsCreated,
        exceptionsCreated: boqResult.exceptionsCreated
      };

      this.updateProgress(job, 'completed', 100, 'Import completed successfully', onProgress);

      // Move to history
      this.jobHistory.push(job);
      this.activeJobs.delete(job.id);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      
      this.updateProgress(job, 'failed', job.progress, job.error, onProgress);
      
      // Move to history
      this.jobHistory.push(job);
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Perform catalog mapping for BOQ items
   */
  private async performCatalogMapping(
    items: ParsedBOQItem[],
    config: ImportConfig,
    onProgress?: (progress: number) => void
  ): Promise<{
    matches: { boqItem: BOQItemForMatching; results: MatchResult[] }[];
    exceptions: MappingException[];
    stats: {
      total: number;
      autoMapped: number;
      needsReview: number;
      failed: number;
      confidence: { high: number; medium: number; low: number };
    };
  }> {
    if (!this.catalogMatcher) {
      await this.loadCatalogItems();
      if (!this.catalogMatcher) {
        throw new Error('Catalog matcher not available');
      }
    }

    // Convert parsed items to matching format
    const boqItems: BOQItemForMatching[] = items.map(item => ({
      itemCode: item.itemCode,
      description: item.description,
      uom: item.uom,
      category: item.category,
      subcategory: item.subcategory
    }));

    // Update matcher configuration
    this.catalogMatcher.config.minConfidence = config.minMappingConfidence;

    // Perform batch matching
    return await this.catalogMatcher.batchMatch(boqItems, (progress, processed, total) => {
      onProgress?.(progress);
    });
  }

  /**
   * Validate import items before saving
   */
  private async validateImportItems(
    parsedItems: ParsedBOQItem[],
    mappingResult: any,
    config: ImportConfig
  ): Promise<ParsedBOQItem[]> {
    const validatedItems: ParsedBOQItem[] = [];

    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      const mapping = mappingResult.matches[i];

      // Apply mapping if auto-mapped
      if (mapping?.results.length > 0) {
        const bestMatch = mapping.results[0];
        if (bestMatch.confidence >= config.minMappingConfidence) {
          // Auto-map the item
          (item as any).catalogItemId = bestMatch.catalogItem.id;
          (item as any).mappingConfidence = bestMatch.confidence;
          (item as any).mappingType = bestMatch.matchType;
        }
      }

      // Handle duplicates
      if (config.duplicateHandling !== 'create_new') {
        const existing = validatedItems.find(existing => 
          existing.itemCode === item.itemCode ||
          (existing.description === item.description && existing.uom === item.uom)
        );

        if (existing) {
          if (config.duplicateHandling === 'skip') {
            continue; // Skip duplicate
          } else if (config.duplicateHandling === 'update') {
            // Update existing item
            Object.assign(existing, item);
            continue;
          }
        }
      }

      validatedItems.push(item);
    }

    return validatedItems;
  }

  /**
   * Save BOQ and related data to database
   */
  private async saveBOQ(
    items: ParsedBOQItem[],
    exceptions: MappingException[],
    context: ProcurementContext,
    config: ImportConfig,
    parseResult: ParseResult
  ): Promise<{ boqId: string; itemsCreated: number; exceptionsCreated: number }> {
    try {
      // Create BOQ record
      const boqData = {
        projectId: context.projectId,
        version: `v${Date.now()}`, // Generate version
        status: config.autoApprove ? 'APPROVED' : 'MAPPING_REVIEW',
        uploadedBy: context.userId,
        mappingStatus: exceptions.length > 0 ? 'NEEDS_REVIEW' : 'COMPLETED',
        fileName: parseResult.metadata.fileName,
        fileSize: parseResult.metadata.fileSize,
        totalItems: items.length,
        mappedItems: items.filter(item => (item as any).catalogItemId).length,
        exceptionsCount: exceptions.length,
        metadata: {
          parseTime: parseResult.metadata.parseTime,
          totalRows: parseResult.metadata.totalRows,
          processedRows: parseResult.metadata.processedRows,
          validRows: parseResult.metadata.validRows,
          skippedRows: parseResult.metadata.skippedRows
        }
      };

      const boq = await procurementApiService.createBOQ(context, boqData);

      // Save BOQ items
      let itemsCreated = 0;
      for (const item of items) {
        try {
          const itemData = {
            boqId: boq.id,
            lineNumber: item.lineNumber,
            itemCode: item.itemCode,
            description: item.description,
            uom: item.uom,
            quantity: item.quantity,
            phase: item.phase,
            task: item.task,
            site: item.site,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            category: item.category,
            subcategory: item.subcategory,
            vendor: item.vendor,
            remarks: item.remarks,
            catalogItemId: (item as any).catalogItemId,
            mappingConfidence: (item as any).mappingConfidence,
            mappingType: (item as any).mappingType,
            rawData: item.rawData
          };

          await procurementApiService.createBOQItem(context, itemData);
          itemsCreated++;
        } catch (error) {
          console.error('Failed to save BOQ item:', error);
        }
      }

      // Save mapping exceptions
      let exceptionsCreated = 0;
      for (const exception of exceptions) {
        try {
          const exceptionData = {
            boqId: boq.id,
            lineNumber: exception.boqItem.description, // Temporary mapping
            itemCode: exception.boqItem.itemCode,
            description: exception.boqItem.description,
            uom: exception.boqItem.uom,
            suggestions: exception.suggestions,
            status: exception.status,
            priority: exception.priority,
            createdAt: exception.createdAt
          };

          await procurementApiService.createBOQException(context, exceptionData);
          exceptionsCreated++;
        } catch (error) {
          console.error('Failed to save mapping exception:', error);
        }
      }

      return {
        boqId: boq.id,
        itemsCreated,
        exceptionsCreated
      };

    } catch (error) {
      console.error('Failed to save BOQ:', error);
      throw new Error(`Failed to save BOQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update job progress
   */
  private updateProgress(
    job: ImportJob,
    stage: string,
    progress: number,
    message?: string,
    onProgress?: ProgressCallback
  ): void {
    job.progress = Math.min(progress, 100);
    job.status = stage as ImportJobStatus;
    onProgress?.(job, stage, progress, message);
  }

  /**
   * Get import job status
   */
  getJobStatus(jobId: string): ImportJob | undefined {
    return this.activeJobs.get(jobId) || 
           this.jobHistory.find(job => job.id === jobId);
  }

  /**
   * Cancel active import job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (job && job.status !== 'completed' && job.status !== 'failed') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      this.jobHistory.push(job);
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Get active jobs
   */
  getActiveJobs(): ImportJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get job history
   */
  getJobHistory(limit?: number): ImportJob[] {
    const history = this.jobHistory.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get import statistics
   */
  getImportStats(): ImportStats {
    const allJobs = [...this.jobHistory, ...Array.from(this.activeJobs.values())];
    const completedJobs = allJobs.filter(job => job.status === 'completed');
    const failedJobs = allJobs.filter(job => job.status === 'failed');

    const totalProcessingTime = completedJobs.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime());
      }
      return sum;
    }, 0);

    const totalItemsImported = completedJobs.reduce((sum, job) => 
      sum + (job.result?.itemsCreated || 0), 0
    );

    const totalMappedItems = completedJobs.reduce((sum, job) => 
      sum + job.metadata.autoMappedItems, 0
    );

    // Aggregate failure reasons
    const failureReasons = new Map<string, number>();
    failedJobs.forEach(job => {
      if (job.error) {
        const reason = job.error.split(':')[0]; // Get main error type
        failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
      }
    });

    const topFailureReasons = Array.from(failureReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalJobs: allJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      averageProcessingTime: completedJobs.length > 0 ? totalProcessingTime / completedJobs.length : 0,
      totalItemsImported,
      averageMappingConfidence: totalMappedItems > 0 ? 
        completedJobs.reduce((sum, job) => sum + job.metadata.autoMappedItems, 0) / totalMappedItems : 0,
      topFailureReasons
    };
  }

  /**
   * Retry failed import job
   */
  async retryJob(jobId: string, context: ProcurementContext): Promise<string> {
    const failedJob = this.jobHistory.find(job => 
      job.id === jobId && job.status === 'failed'
    );

    if (!failedJob) {
      throw new Error('Failed job not found');
    }

    // Create new job based on failed job
    // Note: This would require storing the original file, which isn't implemented here
    throw new Error('Retry functionality requires file storage implementation');
  }

  /**
   * Clean up old job history
   */
  cleanupHistory(olderThanDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const originalLength = this.jobHistory.length;
    this.jobHistory = this.jobHistory.filter(job => 
      job.createdAt.getTime() > cutoffDate.getTime()
    );

    return originalLength - this.jobHistory.length;
  }
}

// Export singleton instance
export const boqImportService = new BOQImportService();