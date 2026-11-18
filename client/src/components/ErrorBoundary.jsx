import { Component } from 'react';
import { ErrorScreen } from './States';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Relay crashed:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          title="Something broke in this view"
          message="Reload to get back to your inbox. Nothing was sent."
          actionLabel="Reload Relay"
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
