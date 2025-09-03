/**
 * BOQ Import Job Manager
 * Handles job lifecycle, tracking, and status management
 */

import { 
  ImportJob, 
  ImportJobStatus, 
  IJobManager 
} from './types';

export class BOQImportJobManager implements IJobManager {
  private activeJobs = new Map<string, ImportJob>();
  private jobHistory: ImportJob[] = [];

  /**
   * Create a new import job
   */
  createJob(file: File): ImportJob {
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
    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ImportJob | undefined {
    return this.activeJobs.get(jobId) || 
           this.jobHistory.find(job => job.id === jobId);
  }

  /**
   * Update job data
   */
  updateJob(job: ImportJob): void {
    if (this.activeJobs.has(job.id)) {
      this.activeJobs.set(job.id, job);
    }
  }

  /**
   * Cancel active job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (job && job.status !== 'completed' && job.status !== 'failed') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      this.moveToHistory(jobId);
      return true;
    }
    return false;
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): ImportJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get job history
   */
  getJobHistory(): ImportJob[] {
    return [...this.jobHistory];
  }

  /**
   * Move job from active to history
   */
  moveToHistory(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      this.jobHistory.push(job);
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Update job progress
   */
  updateProgress(
    jobId: string,
    status: ImportJobStatus,
    progress: number,
    error?: string
  ): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = status;
      job.progress = progress;
      if (error) {
        job.error = error;
      }
      if (status === 'parsing' && !job.startedAt) {
        job.startedAt = new Date();
      }
      if (['completed', 'failed', 'cancelled'].includes(status)) {
        job.completedAt = new Date();
      }
    }
  }

  /**
   * Get job count by status
   */
  getJobCountByStatus(status: ImportJobStatus): number {
    const allJobs = Array.from(this.activeJobs.values()).concat(this.jobHistory);
    return allJobs.filter(job => job.status === status).length;
  }

  /**
   * Clean up old job history
   */
  cleanupHistory(maxHistorySize: number = 100): void {
    if (this.jobHistory.length > maxHistorySize) {
      this.jobHistory = this.jobHistory
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
        .slice(0, maxHistorySize);
    }
  }
}