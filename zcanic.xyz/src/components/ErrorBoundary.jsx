import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-4 text-center text-red-600 /* dark:text-red-300 */ bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
          <h1 className="text-xl font-semibold text-red-700 /* dark:text-red-200 */ mb-2">喵呜！出错了... (Something went wrong.)</h1>
          <p className="text-gray-700 /* dark:text-gray-300 */ mb-2">很抱歉，这里好像坏掉了喵~ 请尝试刷新页面或者联系主人修复。</p>
          {/* Error Details */}
          <details className="text-left text-xs text-gray-600 /* dark:text-gray-400 */ mt-4">
            <summary>Error Details (for debugging)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words p-2 bg-red-50 dark:bg-red-800 rounded text-gray-700 /* dark:text-gray-200 */">
              Error: {this.state.error && this.state.error.toString()}
              <br />
              Component Stack: {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary; 