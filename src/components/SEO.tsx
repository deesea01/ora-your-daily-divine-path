import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  image?: string;
}

const SITE_URL = 'https://oradevotion.com';
const DEFAULT_TITLE = 'Ora | Daily Catholic Prayer & Devotion App';
const DEFAULT_DESC =
  'Grow closer to God daily through guided Catholic prayer, rosary, spiritual reflection, and personalized devotion with Ora.';
const DEFAULT_IMAGE =
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/03a28cdf-367e-44c6-9dac-855d28cd2b06/id-preview-6c2a924e--402451b9-e2f4-4035-9c31-5d5149811cd4.lovable.app-1775525736791.png';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-page SEO. Mounts client-side meta updates. Does not affect visual layout.
 */
const SEO = ({ title, description, canonicalPath, noindex, image }: SEOProps) => {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const fullTitle = title ?? DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESC;
  const canonical = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;
  const img = image ?? DEFAULT_IMAGE;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', canonical);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Ora');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
  }, [fullTitle, desc, canonical, img, noindex]);

  return null;
};

export default SEO;
