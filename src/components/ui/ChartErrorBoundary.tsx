import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Chart Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error details:', { error, errorInfo });
    
    // Check for specific forwardRef errors from recharts
    if (error.message?.includes('forwardRef') || 
        error.message?.includes('Cannot read properties of undefined') ||
        error.stack?.includes('Surface.js')) {
      console.warn('Detected recharts forwardRef error - this is a known bundling issue');
    }
    
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chart Loading Error
          </h3>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            There was an issue loading the chart component. This might be due to a temporary 
            loading problem with the chart library.
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 w-full">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border overflow-auto max-h-40">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <button
            onClick={this.handleRetry}
            className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useChartErrorHandler = () => {
  const handleChartError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Chart error caught:', error, errorInfo);
    
    // Report specific recharts/forwardRef errors
    if (error.message?.includes('forwardRef') || 
        error.message?.includes('Cannot read properties of undefined')) {
      console.warn('Recharts forwardRef error detected - falling back to alternative visualization');
      
      // Could dispatch to error tracking service here
      // errorTrackingService.report(error, { context: 'chart-rendering' });
    }
  };

  return { handleChartError };
};