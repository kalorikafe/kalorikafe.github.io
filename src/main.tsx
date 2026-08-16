import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './routes/AppRouter.tsx'
import { initAnalytics } from './utils/analytics.ts'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { loadCatalog } from './utils/catalogLoader.ts'
import type { MenuItem } from './types/cafe.ts'

const rootElement = document.getElementById('root')!;
initAnalytics();

const mount = (initialItems: readonly MenuItem[] = [], initialError = '') => {
  // Keep the generated semantic HTML visible until the integrity-checked
  // catalog is ready. React takes ownership only once it can render useful UI.
  rootElement.replaceChildren();
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <AppRouter initialItems={initialItems} initialError={initialError} />
      </AppErrorBoundary>
    </StrictMode>,
  );
};

void loadCatalog()
  .then(items => mount(items))
  .catch(reason => mount([], reason instanceof Error ? reason.message : 'Katalog yüklenemedi.'));
