import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Camera, AlertTriangle, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isExpanded: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isExpanded: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, isExpanded: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    window.location.reload();
  };

  private toggleExpanded = () => {
    this.setState(prev => ({ isExpanded: !prev.isExpanded }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            
            <div className="flex justify-center mb-6 relative">
              <div className="relative">
                <Camera className="w-16 h-16 text-slate-700" />
                <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border border-slate-800">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-sm text-gray-400">
                Our camera dropped its lens. We're sorry for the inconvenience.
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <button 
                  onClick={this.toggleExpanded}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="font-medium truncate mr-2">
                    {this.state.error.message || 'Unknown error'}
                  </span>
                  {this.state.isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                
                {this.state.isExpanded && this.state.errorInfo && (
                  <div className="mt-2 p-3 rounded-lg bg-black/50 border border-white/5 text-xs text-gray-500 overflow-auto max-h-48 custom-scrollbar whitespace-pre-wrap font-mono">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
