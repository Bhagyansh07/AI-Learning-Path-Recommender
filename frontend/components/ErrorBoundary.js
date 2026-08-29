import { Component } from 'react';
import Link from 'next/link';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrapper">
          <main className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
            <div className="empty-state">
              <h2>Something went wrong</h2>
              <p>An unexpected error occurred while rendering this page. Try refreshing, or head back home.</p>
              <Link className="btn btn-primary" href="/">Go to Home</Link>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}
