import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Use dynamic import to avoid requiring logger in SSR contexts where console suppression may differ
    // Log errors only in non-production to avoid leaking internal info
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import('../lib/logger').then(({ error: logError }) => logError('ErrorBoundary caught:', error, info.componentStack));
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <div className="eb-actions">
            <button onClick={this.handleRetry}>Retry</button>
            <button onClick={() => window.location.reload()}>Reload Application</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
