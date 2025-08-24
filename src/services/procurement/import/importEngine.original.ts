/**
 * Excel Import Engine - Legacy Compatibility Layer
 * @deprecated Use './engine' module instead for better modularity
 */

import { 
  ImportResult, 
  ProgressCallback, 
  ColumnMapping 
} from './importTypes';
import { ExcelImportEngine as ModularEngine } from './engine';

/**
 * @deprecated Use ExcelImportEngine from './engine' instead
 * Legacy wrapper for backward compatibility
 */
export class ExcelImportEngine {
  private engine: ModularEngine;

  constructor(
    progressCallback?: ProgressCallback,
    customColumnMapping?: Partial<ColumnMapping>
  ) {
    this.engine = new ModularEngine({
      progressCallback,
      customColumnMapping
    });
  }

  /**
   * Parse Excel or CSV file and return structured BOQ data
   * @deprecated Use parseFile from modular engine
   */
  async parseFile(file: File): Promise<ImportResult> {
    return this.engine.parseFile(file);
  }

  /**
   * Set custom column mapping
   * @deprecated Use setColumnMapping from modular engine
   */
  setColumnMapping(mapping: Partial<ColumnMapping>): void {
    this.engine.setColumnMapping(mapping);
  }

  /**
   * Get current column mapping
   * @deprecated Use getColumnMapping from modular engine
   */
  getColumnMapping(): ColumnMapping {
    return this.engine.getColumnMapping();
  }

  /**
   * Process file in chunks for better memory management
   * @deprecated Use parseFileInChunks from modular engine
   */
  async parseFileInChunks(file: File, chunkSize: number = 1000): Promise<ImportResult> {
    return this.engine.parseFileInChunks(file, chunkSize);
  }
}