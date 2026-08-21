import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CHAINS } from '../data/chains';
import type { MenuItem } from '../types/cafe';
import { chainSlug, createProductSlugMap, productPath } from '../utils/slugs';
import { trackEvent } from '../utils/analytics';
import { setDocumentMetadata } from '../utils/documentMetadata';

interface ProductPageProps {
  items: readonly MenuItem[];
}

const sourceLabel = (item: MenuItem): string => {
  switch (item.nutritionSource?.status) {
    case 'verified': return 'Resmî besin verisi';
    case 'mixed': return 'Resmî ve tahmini alanlar birlikte';
    case 'estimated': return 'Tarif ve porsiyon bazlı tahmin';
    default: return 'Kaynak doğrulaması bekleniyor';
  }
};

export const ProductPage: React.FC<ProductPageProps> = ({ items }) => {
  const { chain: requestedChain, product: requestedProduct } = useParams();
  const slugMap = useMemo(() => createProductSlugMap(items), [items]);
  const item = items.find(candidate =>
    chainSlug(candidate.chainId) === requestedChain
    && slugMap.get(candidate.id) === requestedProduct,
  );
  const [shareStatus, setShareStatus] = useState('');
  const chain = CHAINS.find(candidate => candidate.id === item?.chainId);

  useEffect(() => {
    if (!item || !chain) return;
    setDocumentMetadata({
      title: `${item.name} Kalori ve Makroları — ${chain.name} | Kalori Cafe`,
      description: `${chain.name} ${item.name}: ${item.baseMacros.calories} kcal, ${item.baseMacros.protein} g protein ve ${item.baseMacros.caffeine} mg kafein. Kaynak ve alerjen durumunu inceleyin.`,
      path: productPath(item, slugMap),
      image: item.image,
    });
  }, [chain, item, slugMap]);

  if (!item) return <NotFoundPage />;
  if (!chain) return <NotFoundPage />;

  const canonicalUrl = new URL(productPath(item, slugMap), window.location.origin).href;
  const share = async () => {
    const data = { title: `${item.name} — ${chain.name}`, text: `${item.baseMacros.calories} kcal · ${item.baseMacros.protein} g protein · ${item.baseMacros.caffeine} mg kafein`, url: canonicalUrl };
    const shareApi = (navigator as unknown as { share?: (payload: ShareData) => Promise<void> }).share?.bind(navigator);
    try {
      if (shareApi) await shareApi(data);
      else await navigator.clipboard.writeText(canonicalUrl);
      setShareStatus(shareApi ? 'Paylaşım ekranı açıldı.' : 'Bağlantı panoya kopyalandı.');
      trackEvent('share', { chain: item.chainId, category: item.category, surface: 'product_page' });
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') setShareStatus('Bağlantı kopyalanamadı.');
    }
  };

  const macros = [
    ['Kalori', `${item.baseMacros.calories} kcal`],
    ['Protein', `${item.baseMacros.protein} g`],
    ['Karbonhidrat', `${item.baseMacros.carbs} g`],
    ['Şeker', `${item.baseMacros.sugar} g`],
    ['Yağ', `${item.baseMacros.fat} g`],
    ['Kafein', `${item.baseMacros.caffeine} mg`],
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 text-[#2C221E] dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text)]">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)]">
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative flex min-h-[320px] md:min-h-[460px] h-full items-center justify-center overflow-hidden bg-stone-100/90 p-4 sm:p-8 dark:bg-stone-900/60">
            <img
              src={item.image}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-25 blur-2xl scale-125"
            />
            <div className="relative z-10 w-full max-w-md aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xl dark:border-stone-700/60 dark:bg-stone-800">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/images/menu/placeholder.webp';
                }}
              />
            </div>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <Link to={`/zincir/${chainSlug(chain.id)}/`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-amber-700 underline dark:text-amber-300">
              <ArrowLeft className="h-4 w-4" /> {chain.name} kataloğu
            </Link>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-500">{chain.name}</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">{item.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-[var(--dark-text-muted)]">{item.description}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {macros.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-stone-200 p-3 dark:border-[var(--dark-border)]">
                  <dt className="text-[10px] font-black uppercase text-stone-500">{label}</dt>
                  <dd className="mt-1 text-base font-black">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <strong>{sourceLabel(item)}</strong>
              {item.nutritionSource?.servingBasis && <span> · {item.nutritionSource.servingBasis}</span>}
              {item.nutritionSource?.verifiedAt && <span> · {item.nutritionSource.verifiedAt}</span>}
              {item.nutritionSource?.notes && <p className="mt-2">{item.nutritionSource.notes}</p>}
              {item.nutritionSource?.url && (
                <a href={item.nutritionSource.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1 font-black underline">
                  Kaynağı aç <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {item.imageSource && (
              <div className="rounded-2xl border border-stone-200 p-4 text-xs leading-relaxed text-stone-600 dark:border-[var(--dark-border)] dark:text-[var(--dark-text-muted)]">
                <strong className="text-stone-900 dark:text-[var(--dark-text)]">
                  {item.imageSource.kind === 'official' ? 'Resmî ürün görseli' : 'Temsilî, lisanslı görsel'}
                </strong>
                {item.imageSource.author && item.imageSource.author !== 'unknown' && <span> · {item.imageSource.author}</span>}
                {item.imageSource.license && item.imageSource.license !== 'unknown' && (
                  item.imageSource.licenseUrl && item.imageSource.licenseUrl !== 'unknown'
                    ? <span> · <a href={item.imageSource.licenseUrl} target="_blank" rel="license noreferrer" className="font-bold underline">{item.imageSource.license}</a></span>
                    : <span> · {item.imageSource.license}</span>
                )}
                {(item.imageSource.sourcePageUrl || item.imageSource.url) && (
                  <a href={item.imageSource.sourcePageUrl || item.imageSource.url} target="_blank" rel="noreferrer" className="mt-2 flex min-h-11 items-center gap-1 font-black underline">
                    Görsel kaynağını aç <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2C221E] px-5 py-3 text-sm font-black text-white dark:bg-[#FAF8F5] dark:text-[#2C221E]">
              <Share2 className="h-4 w-4" /> Paylaş
            </button>
            <p role="status" className="min-h-5 text-xs text-stone-500">{shareStatus}</p>
          </div>
        </div>
      </article>
    </main>
  );
};

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    setDocumentMetadata({
      title: 'Sayfa bulunamadı | Kalori Cafe',
      description: 'Aradığınız Kalori Cafe sayfası bulunamadı.',
      path: window.location.pathname,
      robots: 'noindex,follow',
    });
  }, []);
  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF8F5] px-4 text-center text-[#2C221E] dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text)]">
      <div className="space-y-4">
        <p className="text-sm font-black uppercase tracking-widest text-amber-700">404</p>
        <h1 className="text-3xl font-black">Sayfa bulunamadı</h1>
        <p className="text-stone-600 dark:text-[var(--dark-text-muted)]">Ürün kaldırılmış veya bağlantı değişmiş olabilir.</p>
        <Link to="/" className="inline-flex min-h-11 items-center rounded-xl bg-[#2C221E] px-5 py-3 font-black text-white dark:bg-[#FAF8F5] dark:text-[#2C221E]">Güncel kataloğa dön</Link>
      </div>
    </main>
  );
};
