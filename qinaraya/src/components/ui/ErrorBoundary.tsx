import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Menangkap error render agar pemain melihat pesan jelas, bukan layar kosong. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Qinaraya render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <h2 className="text-2xl font-bold">Dunia gagal dimuat</h2>
        <p className="max-w-sm text-sm opacity-80">
          Perangkat atau browser Anda mungkin belum mendukung grafis 3D (WebGL). Coba muat ulang halaman
          atau gunakan browser lain.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg px-5 py-3 text-base font-semibold"
          style={{ background: "var(--qin-moss)", color: "var(--qin-night)" }}
        >
          Muat ulang
        </button>
      </div>
    );
  }
}
