/**
 * File Validator
 * Validates file properties and constraints
 */

/**
 * File validation utilities
 */
export class FileValidator {
  /**
   * Validate file before processing
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`);
    }
    
    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedTypes = ['csv', 'xlsx', 'xls'];
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      errors.push('Unsupported file type. Please upload CSV or Excel files.');
    }
    
    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file extension is supported
   */
  static isSupportedFileType(fileName: string): boolean {
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const allowedTypes = ['csv', 'xlsx', 'xls'];
    return Boolean(fileExtension && allowedTypes.includes(fileExtension));
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(fileName: string): string | null {
    const extension = fileName.toLowerCase().split('.').pop();
    return extension || null;
  }

  /**
   * Validate file for specific constraints
   */
  static validateFileForImport(file: File, options: {
    maxSizeMB?: number;
    requiredExtensions?: string[];
    maxNameLength?: number;
  } = {}): { isValid: boolean; errors: string[] } {
    const {
      maxSizeMB = 50,
      requiredExtensions = ['csv', 'xlsx', 'xls'],
      maxNameLength = 255
    } = options;
    
    const errors: string[] = [];
    
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`);
    }
    
    // Check file type
    const fileExtension = this.getFileExtension(file.name);
    if (!fileExtension || !requiredExtensions.includes(fileExtension)) {
      errors.push(`Unsupported file type. Please upload ${requiredExtensions.join(', ')} files.`);
    }
    
    // Check file name length
    if (file.name.length > maxNameLength) {
      errors.push(`File name is too long (max ${maxNameLength} characters)`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
