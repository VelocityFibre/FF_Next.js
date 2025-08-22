/**
 * NotificationService - Centralized notification management
 * Provides consistent user feedback across the application
 */

import toast, { ToastOptions, ToastPosition } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationOptions extends ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

export interface NotificationConfig {
  position: ToastPosition;
  duration: number;
  style: Record<string, string>;
  successIcon: string;
  errorIcon: string;
  warningIcon: string;
  infoIcon: string;
}

class NotificationService {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#ffffff',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      successIcon: '✅',
      errorIcon: '❌',
      warningIcon: '⚠️',
      infoIcon: 'ℹ️',
    };
  }

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions): string {
    return toast.success(message, {
      ...this.getDefaultOptions(),
      ...options,
      icon: options?.icon || this.config.successIcon,
    });
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions): string {
    return toast.error(message, {
      ...this.getDefaultOptions(),
      duration: options?.persistent ? Infinity : 6000,
      ...options,
      icon: options?.icon || this.config.errorIcon,
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.getDefaultOptions(),
      ...options,
      icon: options?.icon || this.config.warningIcon,
      style: {
        ...this.config.style,
        borderColor: '#f59e0b',
        ...options?.style,
      },
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.getDefaultOptions(),
      ...options,
      icon: options?.icon || this.config.infoIcon,
      style: {
        ...this.config.style,
        borderColor: '#3b82f6',
        ...options?.style,
      },
    });
  }

  /**
   * Show loading notification
   */
  loading(message: string, options?: NotificationOptions): string {
    return toast.loading(message, {
      ...this.getDefaultOptions(),
      ...options,
    });
  }

  /**
   * Show promise-based notification
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: NotificationOptions
  ): Promise<T> {
    return toast.promise(promise, messages, {
      ...this.getDefaultOptions(),
      ...options,
    });
  }

  /**
   * Dismiss notification by ID
   */
  dismiss(toastId?: string): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Update notification configuration
   */
  configure(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get default options based on current config
   */
  private getDefaultOptions(): ToastOptions {
    return {
      position: this.config.position,
      duration: this.config.duration,
      style: this.config.style,
    };
  }

  /**
   * Operation success helper
   */
  operationSuccess(operation: string, entity?: string): string {
    const message = entity 
      ? `${entity} ${operation} successfully`
      : `${operation} completed successfully`;
    return this.success(message);
  }

  /**
   * Operation error helper
   */
  operationError(operation: string, error: string | Error, entity?: string): string {
    const errorMessage = error instanceof Error ? error.message : error;
    const message = entity
      ? `Failed to ${operation} ${entity}: ${errorMessage}`
      : `${operation} failed: ${errorMessage}`;
    return this.error(message);
  }

  /**
   * Validation error helper
   */
  validationError(message: string): string {
    return this.warning(`Validation Error: ${message}`);
  }

  /**
   * Network error helper
   */
  networkError(): string {
    return this.error('Network error. Please check your connection and try again.');
  }

  /**
   * Permission error helper
   */
  permissionError(): string {
    return this.error('You do not have permission to perform this action.');
  }

  /**
   * Confirmation helper (to be implemented with a proper modal component)
   */
  async confirm(message: string, _options?: NotificationOptions): Promise<boolean> {
    // For now, use browser confirm - to be replaced with proper modal
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;