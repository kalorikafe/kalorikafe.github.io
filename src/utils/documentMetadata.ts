const SITE_ORIGIN = 'https://kalorikafe.github.io';

interface DocumentMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
  robots?: 'index,follow' | 'noindex,follow';
}

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string): void => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
};

export const setDocumentMetadata = ({
  title,
  description,
  path,
  image = '/social-card.png',
  robots = 'index,follow',
}: DocumentMetadata): void => {
  const canonical = new URL(path, SITE_ORIGIN).href;
  const socialImage = new URL(image, SITE_ORIGIN).href;
  document.title = title;

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.append(canonicalLink);
  }
  canonicalLink.href = canonical;

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', robots);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
  setMeta('meta[property="og:image"]', 'property', 'og:image', socialImage);
  setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', image === '/social-card.png'
    ? 'Kalori Cafe — kafe ürünlerini veriye göre seç'
    : `${title} görseli`);
  if (image === '/social-card.png') {
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  } else {
    document.head.querySelector('meta[property="og:image:width"]')?.remove();
    document.head.querySelector('meta[property="og:image:height"]')?.remove();
  }
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage);
};
