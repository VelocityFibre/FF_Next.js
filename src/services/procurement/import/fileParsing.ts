/**
 * File Parsing Service - Main Entry Point
 * Coordinates different file parsing operations
 */

import { CSVParser } from './parsers/csvParser';
import { ExcelParser } from './parsers/excelParser';
import { FileInfoExtractor } from './utils/fileInfoExtractor';
import type { FileInfo } from './importTypes';

/**
 * Read file based on its type (Excel or CSV)
 */
export async function readFile(file: File): Promise<any[]> {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  
  if (fileExtension === 'csv') {
    return CSVParser.parseCSVFile(file);
  } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
    return ExcelParser.parseExcelFile(file);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

/**
 * Read CSV file and return array of rows
 */
export async function readCSVFile(file: File): Promise<any[]> {
  return CSVParser.parseCSVFile(file);
}

/**
 * Parse a single CSV line handling quoted values and escapes
 */
export function parseCSVLine(line: string): string[] {
  return CSVParser.parseCSVLine(line);
}

/**
 * Read Excel file using XLSX library
 */
export async function readExcelFile(file: File): Promise<any[]> {
  return ExcelParser.parseExcelFile(file);
}

/**
 * Format cell values from Excel to consistent types
 */
function formatCellValue(value: any): any {
  return ExcelParser.formatCellValue(value);
}

/**
 * Read Excel file from specific worksheet
 */
export async function readExcelWorksheet(file: File, worksheetName: string): Promise<any[]> {
  return ExcelParser.parseSpecificWorksheet(file, worksheetName);
}

/**
 * Get file information without fully processing the content
 */
export async function getFileInfo(file: File): Promise<FileInfo> {
  return FileInfoExtractor.getFileInfo(file);
}

/**
 * Detect file encoding for better text processing
 */
export function detectFileEncoding(file: File): Promise<string> {
  return FileInfoExtractor.detectFileEncoding(file);
}