import React, { type ErrorInfo, type ReactNode } from 'react';
import { STORAGE_KEYS, STORAGE_QUARANTINE_KEY } from '../utils/persistentStorage';

interface State {
  error?: Error;
}

export class AppErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Kalori Cafe UI error', error, info.componentStack);
  }

  private resetLocalData = (): void => {
    try {
      for (const key of [...Object.values(STORAGE_KEYS), STORAGE_QUARANTINE_KEY]) localStorage.removeItem(key);
    } finally {
      window.location.assign('/');
    }
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8F5] p-6 text-center text-[#2C221E] dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text)]">
        <div className="max-w-lg space-y-4" role="alert">
          <h1 className="text-2xl font-black">Bu görünüm açılamadı</h1>
          <p className="text-sm text-stone-600 dark:text-[var(--dark-text-muted)]">Sayfayı yenileyin. Sorun eski veya bozuk cihaz verisinden kaynaklanıyorsa yalnız Kalori Cafe’ye ait yerel kayıtları sıfırlayabilirsiniz.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-[#2C221E] px-5 py-3 font-black text-white dark:bg-[#FAF8F5] dark:text-[#2C221E]">Yeniden dene</button>
            <button type="button" onClick={this.resetLocalData} className="min-h-11 rounded-xl border border-red-300 px-5 py-3 font-black text-red-700 dark:border-red-900 dark:text-red-300">Yerel veriyi sıfırla</button>
          </div>
        </div>
      </main>
    );
  }
}

