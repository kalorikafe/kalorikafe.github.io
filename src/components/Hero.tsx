import React from 'react';
import { Sparkles, Zap, Flame, ShieldCheck, HeartPulse } from 'lucide-react';

interface HeroProps {
  onSelectQuickFilter: (filter: string) => void;
  itemCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onSelectQuickFilter, itemCount }) => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-50/90 via-white to-[#F5EBE6] dark:from-[#241E1A] dark:via-[#1C1816] dark:to-[#171412] border border-stone-200/90 dark:border-[var(--dark-border)]/90 p-6 md:p-10 text-center space-y-6 shadow-xl dark:shadow-none">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[var(--dark-surface-elevated)]/90 border border-[#6F4E37]/20 dark:border-[#D4B996]/30 text-[#6F4E37] dark:text-[#D4B996] text-xs font-black tracking-wide shadow-xs">
          <Sparkles className="w-4 h-4 text-[#6F4E37] dark:text-[#D4B996] fill-[#6F4E37]/20" />
          <span>Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-[var(--dark-text)] tracking-tight leading-tight max-w-4xl mx-auto">
          Sevdiğin Kahvenin Kalorisini & <span className="text-[#6F4E37] dark:text-[#D4B996]">Alerjenlerini Keşfet</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-stone-600 dark:text-[var(--dark-text-muted)] font-medium max-w-2xl mx-auto leading-relaxed">
          Starbucks, Espressolab, Caffè Nero, Coffy, Kahve Dünyası ve daha fazlası... Süt türü, boyut ve şuruba göre anlık makro hesabı yapın, glüten ve laktoz risklerini önceden görün.
        </p>

        {/* Honest data disclaimer — always visible */}
        <p className="mx-auto max-w-3xl text-[11px] leading-relaxed text-stone-500 dark:text-[var(--dark-text-muted)] bg-white/70 dark:bg-[var(--dark-surface-elevated)]/70 border border-stone-200/70 dark:border-[var(--dark-border)]/60 rounded-2xl px-4 py-2.5">
          ⚖️ Buradaki kalori, makro ve kafein değerleri zincirlerin resmî menülerinden derlenen
          <strong> tahminî referans değerleridir</strong>; ürün başına resmî besin tablosu yayımlanmıyor.
          Alerjen bilgileri garanti değildir — çapraz bulaşma riski için markanın güncel resmî
          bilgilerini kontrol edin. Bu uygulama tıbbi tavsiye vermez.
        </p>

        {/* 4 Professional Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/60 hover:border-[#6F4E37]/40 dark:hover:border-[#D4B996]/40 transition-all shadow-xs flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-[var(--dark-text)]">10 Kafe Zinciri</div>
              <div className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] font-semibold mt-0.5">{itemCount} Ürünlük Katalog</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/60 hover:border-[#6F4E37]/40 dark:hover:border-[#D4B996]/40 transition-all shadow-xs flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-[var(--dark-text)]">Anlık Özelleştirici</div>
              <div className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] font-semibold mt-0.5">Süt, Şurup & Boyut</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/60 hover:border-[#6F4E37]/40 dark:hover:border-[#D4B996]/40 transition-all shadow-xs flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-[var(--dark-text)]">Alerjen Profil Filtresi</div>
              <div className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] font-semibold mt-0.5">Glüten, Laktoz & Yulaf</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/60 hover:border-[#6F4E37]/40 dark:hover:border-[#D4B996]/40 transition-all shadow-xs flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-[var(--dark-text)]">Günlük Makro Sepet</div>
              <div className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] font-semibold mt-0.5">MyFitnessPal Kopyala</div>
            </div>
          </div>

        </div>

        {/* Popular Quick Search Pills */}
        <div className="pt-3 border-t border-stone-200/60 dark:border-[var(--dark-border)]/60 max-w-3xl mx-auto">
          <div className="text-xs font-bold text-stone-500 dark:text-[var(--dark-text-muted)] mb-2.5 uppercase tracking-wider">
            Hızlı Filtreleme Seçenekleri
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '☕ Starbucks', filter: 'Starbucks' },
              { label: '☕ Espressolab', filter: 'Espressolab' },
              { label: '☕ Kahve Dünyası', filter: 'Kahve Dünyası' },
              { label: '☕ Caffè Nero', filter: 'Nero' },
              { label: '🌾 Glutensiz Seçenekler', filter: 'Glutensiz' },
              { label: '🧊 Soğuk Kahveler', filter: 'Soğuk Kahve' },
              { label: '💪 Yüksek Protein', filter: 'High Protein' },
              { label: '🇹🇷 Türk Kahvesi', filter: 'Türk Kahvesi' },
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuickFilter(pill.filter)}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[var(--dark-surface-elevated)]/90 border border-stone-200 dark:border-[var(--dark-border)] text-stone-800 dark:text-[var(--dark-text)] text-xs font-bold hover:border-[#6F4E37] dark:hover:border-[#D4B996] hover:bg-[#6F4E37] hover:text-white dark:hover:bg-[#D4B996] dark:hover:text-[#2C221E] transition-all shadow-xs"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
