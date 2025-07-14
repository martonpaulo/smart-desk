import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: unknown): void {
    console.error('Unhandled error:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <pre>{this.state.errorMessage}</pre>;
    }
    return this.props.children;
  }
}
