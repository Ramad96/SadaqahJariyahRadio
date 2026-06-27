import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center rounded-2xl" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-sm">Something went wrong. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
