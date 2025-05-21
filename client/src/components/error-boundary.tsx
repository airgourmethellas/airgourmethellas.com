import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './error-fallback';
import { trackError } from '@/utils/error-tracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track the error with our error tracking utility
    const errorId = trackError(error, this.props.componentName || 'unknown');
    
    console.error('Uncaught error:', error, errorInfo);
    
    // Update state with the error ID
    this.setState({ errorId });
  }

  public resetErrorBoundary = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorId: null 
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback 
              error={this.state.error as Error}
              errorId={this.state.errorId || undefined}
              resetErrorBoundary={this.resetErrorBoundary} 
             />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;