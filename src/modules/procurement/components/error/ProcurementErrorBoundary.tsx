import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'module' | 'component' | 'page';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Procurement-specific error boundary
 * Provides specialized error handling for procurement operations
 * Integrates with existing FibreFlow error reporting
 */
export class ProcurementErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      showDetails: false 
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Procurement Module Error:', error, errorInfo);
    
    // Log to procurement-specific error tracking
    this.logProcurementError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private logProcurementError = (error: Error, errorInfo: ErrorInfo) => {
    // Procurement-specific error logging
    const errorData = {
      module: 'procurement',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Add procurement context if available
      projectId: this.getProcurementContext()?.projectId,
      userId: this.getProcurementContext()?.userId,
    };

    // Send to error tracking service
    console.error('Procurement Error Data:', errorData);
    
    // TODO: Integrate with actual error tracking service
    // errorTrackingService.logError(errorData);
  };

  private getProcurementContext = () => {
    try {
      // Extract procurement context from URL or state
      const path = window.location.pathname;
      const projectMatch = path.match(/\/projects\/([^\/]+)/);
      const projectId = projectMatch ? projectMatch[1] : null;
      
      return {
        projectId,
        userId: null, // TODO: Get from auth context
        module: 'procurement',
      };
    } catch {
      return null;
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private getProcurementErrorMessage = (error: Error): { title: string; message: string; suggestions: string[] } => {
    const message = error.message?.toLowerCase() || '';
    
    // BOQ-specific errors
    if (message.includes('boq') || message.includes('bill of quantities')) {
      return {
        title: 'BOQ Processing Error',
        message: 'There was an issue processing the Bill of Quantities.',
        suggestions: [
          'Check that the BOQ file format is correct',
          'Verify all required fields are populated',
          'Ensure the BOQ is mapped to catalog items',
          'Try re-uploading the BOQ file'
        ]
      };
    }
    
    // RFQ-specific errors
    if (message.includes('rfq') || message.includes('request for quote')) {
      return {
        title: 'RFQ Processing Error',
        message: 'There was an issue with the Request for Quote.',
        suggestions: [
          'Verify supplier selections are valid',
          'Check that all RFQ items have proper specifications',
          'Ensure response deadline is in the future',
          'Try refreshing the supplier list'
        ]
      };
    }
    
    // Stock-specific errors
    if (message.includes('stock') || message.includes('inventory')) {
      return {
        title: 'Stock Management Error',
        message: 'There was an issue with inventory operations.',
        suggestions: [
          'Verify stock positions are up to date',
          'Check that movement types are valid',
          'Ensure sufficient stock is available',
          'Try refreshing the stock data'
        ]
      };
    }
    
    // Supplier-specific errors
    if (message.includes('supplier') || message.includes('vendor')) {
      return {
        title: 'Supplier Management Error',
        message: 'There was an issue with supplier operations.',
        suggestions: [
          'Verify supplier information is complete',
          'Check supplier authentication status',
          'Ensure supplier has necessary permissions',
          'Try refreshing the supplier list'
        ]
      };
    }
    
    // Generic procurement error
    return {
      title: 'Procurement System Error',
      message: 'An unexpected error occurred in the procurement module.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Verify you have the necessary permissions',
        'Contact support if the issue persists'
      ]
    };
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorDetails = this.getProcurementErrorMessage(this.state.error!);
      const isComponentLevel = this.props.level === 'component';

      return (
        <div className={`${isComponentLevel ? 'bg-red-50 border border-red-200 rounded-lg p-4' : 'min-h-screen bg-gray-50 flex items-center justify-center px-4'}`}>
          <div className={`${isComponentLevel ? 'w-full' : 'max-w-2xl w-full'}`}>
            <div className="bg-white shadow-lg rounded-lg p-8">
              {/* Error Icon and Title */}
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {errorDetails.title}
              </h1>
              
              <p className="text-gray-600 text-center mb-6">
                {errorDetails.message}
              </p>

              {/* Error Message */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-mono text-red-800">
                    {this.state.error.message || 'An unexpected error occurred'}
                  </p>
                </div>
              )}

              {/* Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Suggested Actions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {!isComponentLevel && (
                  <button
                    onClick={this.handleReload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </button>
                )}
                
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Try Again
                </button>
                
                {!isComponentLevel && (
                  <Link
                    to="/app/procurement"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Procurement Home
                  </Link>
                )}
              </div>

              {/* Technical Details (Collapsible) */}
              <div className="border-t pt-4">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {this.state.showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Technical Details
                </button>
                
                {this.state.showDetails && this.state.errorInfo && (
                  <div className="mt-4 space-y-4">
                    {/* Error Type */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Error Type
                      </h3>
                      <p className="text-sm text-gray-700">{this.state.error?.name}</p>
                    </div>
                    
                    {/* Stack Trace */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Stack Trace
                      </h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    
                    {/* Component Stack */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Component Stack
                      </h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help Text */}
            {!isComponentLevel && (
              <p className="text-center text-sm text-gray-500 mt-6">
                If this problem persists, please contact support with the error details above.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for easier use
export function withProcurementErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: 'module' | 'component' | 'page' = 'component'
) {
  const WrappedComponent = (props: P) => (
    <ProcurementErrorBoundary level={level}>
      <Component {...props} />
    </ProcurementErrorBoundary>
  );
  WrappedComponent.displayName = `withProcurementErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}