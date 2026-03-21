import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-surface text-on-surface flex-col gap-4">
          <span className="material-symbols-outlined text-[64px] text-error">error</span>
          <h1 className="font-headline font-bold text-2xl text-on-surface">Oops! A Clinical Error Occurred</h1>
          <p className="text-on-surface-variant font-medium text-center max-w-md">
            The application encountered an unexpected error. This has been logged.
            <br />
            <span className="text-xs opacity-70 mt-2 block font-mono bg-surface-container-high p-2 rounded">
              {this.state.error?.toString()}
            </span>
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="mt-4 px-6 py-2 surgical-gradient text-on-primary-container font-headline font-bold rounded shadow hover:opacity-90 transition-opacity"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
