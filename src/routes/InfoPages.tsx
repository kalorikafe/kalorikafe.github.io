import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setDocumentMetadata } from '../utils/documentMetadata';

const PageShell: React.FC<React.PropsWithChildren<{ title: string; description: string; path: string }>> = ({ title, description, path, children }) => {
  useEffect(() => {
    setDocumentMetadata({ title: `${title} | Kalori Cafe`, description, path });
  }, [description, path, title]);
  return <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-[#2C221E] dark:bg-[var(--dark-bg)] dark:text-[var(--dark-text)]">
    <article className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)] sm:p-10">
      <Link to="/" className="inline-flex min-h-11 items-center font-black text-amber-700 underline dark:text-amber-300">← Kataloğa dön</Link>
      <h1 className="text-3xl font-black">{title}</h1>
      {children}
    </article>
  </main>;
};

export const MethodologyPage: React.FC = () => (
  <PageShell title="Veri metodolojisi" path="/metodoloji/" description="Kalori Cafe ürün, besin, alerjen, porsiyon, kaynak ve tahmin verilerini nasıl toplar ve günceller?">
    <p>Ürün varlığı için resmî menüler, resmî uygulamalar ve markanın yönlendirdiği sipariş yüzeyleri önceliklendirilir. Bir ürünün menüde bulunması ile besin değerinin doğrulanması ayrı kanıtlardır.</p>
    <h2 className="text-xl font-black">Besin güven düzeyi</h2>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong>Resmî:</strong> Alan doğrudan markanın yayımladığı porsiyon tablosundan alınmıştır.</li>
      <li><strong>Türetilmiş:</strong> Örneğin tuzdan sodyum gibi, açık bir dönüşümle hesaplanmıştır.</li>
      <li><strong>Tahmini:</strong> Tarif ve porsiyon varsayımına dayanır.</li>
      <li><strong>Bilinmiyor:</strong> Güvenilir bir sayı yoktur; sahte kesinlik üretilmez.</li>
    </ul>
    <h2 className="text-xl font-black">Alerjen sınırı</h2>
    <p>Bilgi tıbbi tavsiye değildir. Reçete değişikliği ve çapraz bulaşma mümkündür; ciddi alerjiniz varsa sipariş öncesi markadan ve şubeden teyit alın.</p>
    <p>“Glutensiz” ve “laktozsuz” filtreleri yalnız kaynaklı alerjen verisi bulunan ürünleri kabul eder. Vegan, vejetaryen ve beslenme etiketleri katalog sınıflandırmasıdır; sertifika anlamına gelmez.</p>
    <h2 className="text-xl font-black">Güncellik</h2>
    <p>Sezonluk ürünleri en geç 30, çekirdek menüyü en geç 90 günde yeniden kontrol etmeyi hedefleriz. Bir ürün tek gözlemde silinmez; iki ardışık kontrolde görünmezse “emekli” değerlendirmesine alınır.</p>
  </PageShell>
);

export const PrivacyPage: React.FC = () => (
  <PageShell title="Gizlilik" path="/gizlilik/" description="Kalori Cafe yerel veri saklama ve mahremiyet odaklı, hassas veri toplamayan ölçüm ilkeleri.">
    <p>Kalori Cafe local-first çalışır. Favoriler, alerjen tercihleri, günlük hedefler, tarifler ve sepet yalnız bu tarayıcıdaki yerel depolamada tutulur; hesap veya uygulama sunucusuna gönderilmez.</p>
    <h2 className="text-xl font-black">Anonim ölçüm</h2>
    <p>Ölçüm yapılandırılırsa yalnız sayfa görüntüleme, özellik kullanımı ve Web Vitals değerleri sayılır. Arama metni, yaş, cinsiyet, kilo, boy, sağlık hedefi, alerjen seçimi, tarif adı ve sepet içeriği hiçbir ölçüm olayına eklenmez. “Do Not Track” tercihi uygulanır.</p>
    <h2 className="text-xl font-black">Cihazınızdaki veriler</h2>
    <p>Tarayıcı verilerini temizlediğinizde kişisel kayıtlarınız silinir. Geçersiz veya eski kayıtlar uygulamanın açılmasını engellemez; güvenli varsayılana döndürülür.</p>
  </PageShell>
);
