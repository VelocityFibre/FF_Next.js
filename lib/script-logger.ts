#!/usr/bin/env node
import { scriptLogger } from './logger';

// Helper for script execution
export class ScriptRunner {
  private scriptName: string;
  private logger: typeof scriptLogger;
  
  constructor(scriptName: string) {
    this.scriptName = scriptName;
    this.logger = scriptLogger.child({ script: scriptName });
  }
  
  log(message: string, data?: any) {
    this.logger.info(data, message);
  }
  
  debug(message: string, data?: any) {
    this.logger.debug(data, message);
  }
  
  warn(message: string, data?: any) {
    this.logger.warn(data, message);
  }
  
  error(message: string, error?: any) {
    if (error instanceof Error) {
      this.logger.error({
        error: error.message,
        stack: error.stack,
        ...error
      }, message);
    } else {
      this.logger.error(error, message);
    }
  }
  
  success(message: string, data?: any) {
    this.logger.info({ ...data, success: true }, `✅ ${message}`);
  }
  
  async run(fn: () => Promise<void>) {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting script: ${this.scriptName}`);
      await fn();
      const duration = Date.now() - startTime;
      this.logger.info({ duration }, `Script completed: ${this.scriptName} (${duration}ms)`);
      process.exit(0);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error({
        error: error.message,
        stack: error.stack,
        duration
      }, `Script failed: ${this.scriptName}`);
      process.exit(1);
    }
  }
  
  // Progress tracking for long-running scripts
  startProgress(total: number, message: string) {
    let current = 0;
    const startTime = Date.now();
    
    return {
      update: (completed: number, item?: string) => {
        current = completed;
        const percentage = Math.round((current / total) * 100);
        const elapsed = Date.now() - startTime;
        const rate = current / (elapsed / 1000);
        const remaining = (total - current) / rate;
        
        this.logger.info({
          progress: {
            current,
            total,
            percentage,
            elapsed,
            rate: Math.round(rate),
            remaining: Math.round(remaining),
            item
          }
        }, `${message}: ${current}/${total} (${percentage}%) - ${item || 'Processing...'}`);
      },
      
      complete: () => {
        const elapsed = Date.now() - startTime;
        this.logger.info({
          progress: {
            total,
            elapsed,
            rate: Math.round(total / (elapsed / 1000))
          }
        }, `${message}: Completed ${total} items in ${elapsed}ms`);
      }
    };
  }
}

// Export a factory function
export const createScriptRunner = (scriptName: string) => new ScriptRunner(scriptName);