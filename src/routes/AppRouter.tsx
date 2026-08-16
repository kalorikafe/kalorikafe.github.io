import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { App } from '../App';
import { CHAINS } from '../data/chains';
import type { MenuItem } from '../types/cafe';
import { loadCatalog } from '../utils/catalogLoader';
import { chainSlug } from '../utils/slugs';
import { MethodologyPage, PrivacyPage } from './InfoPages';
import { NotFoundPage, ProductPage } from './ProductPage';

const ChainCatalogRoute: React.FC<{ items: readonly MenuItem[] }> = ({ items }) => {
  const { chain } = useParams();
  const chainId = useMemo(
    () => CHAINS.find(candidate => chainSlug(candidate.id) === chain)?.id,
    [chain],
  );
  return chainId ? <App catalogItems={items} initialChainId={chainId} /> : <NotFoundPage />;
};

const CatalogRoutes: React.FC<{ items: readonly MenuItem[] }> = ({ items }) => (
  <Routes>
    <Route path="/" element={<App catalogItems={items} />} />
    <Route path="/zincir/:chain/" element={<ChainCatalogRoute items={items} />} />
    <Route path="/urun/:chain/:product/" element={<ProductPage items={items} />} />
    <Route path="/metodoloji/" element={<MethodologyPage />} />
    <Route path="/gizlilik/" element={<PrivacyPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

interface AppRouterProps {
  initialItems?: readonly MenuItem[];
  initialError?: string;
}

export const AppRouter: React.FC<AppRouterProps> = ({ initialItems = [], initialError = '' }) => {
  const [items, setItems] = useState<readonly MenuItem[]>(initialItems);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (items.length > 0 || error) return;
    let active = true;
    loadCatalog()
      .then(catalog => { if (active) setItems(catalog); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Katalog yüklenemedi.'); });
    return () => { active = false; };
  }, [error, items.length]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8F5] p-6 text-center text-[#2C221E] dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text)]">
        <div className="max-w-md space-y-4" role="alert">
          <h1 className="text-2xl font-black">Katalog açılamadı</h1>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-[#2C221E] px-5 py-3 font-black text-white dark:bg-[#FAF8F5] dark:text-[#2C221E]">Yeniden dene</button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return <div className="grid min-h-screen place-items-center bg-[#FAF8F5] text-sm font-bold text-stone-600 dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text-muted)]" role="status">Katalog yükleniyor…</div>;
  }

  const base = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');
  return <BrowserRouter basename={base}><CatalogRoutes items={items} /></BrowserRouter>;
};
