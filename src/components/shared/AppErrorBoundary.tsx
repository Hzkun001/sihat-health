import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SIHAT] Unhandled render error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      route: window.location.hash,
    });
  }

  private reset = () => {
    this.setState({ error: null });
    window.location.hash = '#/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-0 px-6">
        <section className="w-full max-w-xl border-y border-surface-200 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink-900">Halaman tidak dapat ditampilkan</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink-500">
            Terjadi kesalahan pada antarmuka. Data yang sudah tersimpan tidak terhapus.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-green px-5 text-sm font-bold text-white"
          >
            <RefreshCw size={16} />
            Kembali ke beranda
          </button>
        </section>
      </main>
    );
  }
}
