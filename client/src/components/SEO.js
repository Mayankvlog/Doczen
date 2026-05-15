import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../index';

const BASE_URL = 'https://doczen.app';
const SITE_NAME = 'Doczen';
const DEFAULT_DESC = 'Doczen - Free Online PDF Editor. Merge, split, compress, convert and edit PDF files online for free. No installation required.';

const LOCALE_MAP = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', it: 'it_IT',
  pt: 'pt_BR', nl: 'nl_NL', ru: 'ru_RU', ja: 'ja_JP', 'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW', ko: 'ko_KR', ar: 'ar_SA', hi: 'hi_IN', tr: 'tr_TR',
  pl: 'pl_PL', sv: 'sv_SE', da: 'da_DK', no: 'nb_NO', fi: 'fi_FI',
  cs: 'cs_CZ', sk: 'sk_SK', hu: 'hu_HU', ro: 'ro_RO', bg: 'bg_BG',
  el: 'el_GR', th: 'th_TH', vi: 'vi_VN', id: 'id_ID', ms: 'ms_MY',
  uk: 'uk_UA', he: 'he_IL', ca: 'ca_ES', hr: 'hr_HR', sr: 'sr_RS',
  sl: 'sl_SI', lt: 'lt_LT', lv: 'lv_LV', et: 'et_EE', is: 'is_IS',
  eu: 'eu_ES', gl: 'gl_ES', cy: 'cy_GB', fil: 'fil_PH', sw: 'sw_KE',
  ta: 'ta_IN', te: 'te_IN', mr: 'mr_IN', gu: 'gu_IN', kn: 'kn_IN',
  ml: 'ml_IN', bn: 'bn_BD', pa: 'pa_IN', fa: 'fa_IR', ur: 'ur_PK',
  ne: 'ne_NP', my: 'my_MM',
};

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords = '',
  canonical = '',
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  author = 'Doczen',
  noIndex = false
}) {
  const { lang } = useLanguage();
  const pageTitle = title ? `${title} | Doczen - Free Online PDF Editor` : `${SITE_NAME} - Free Online PDF Editor`;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const pageKeywords = keywords
    ? `${keywords}, PDF editor, online PDF, free PDF tools, Doczen`
    : 'PDF editor, online PDF, free PDF tools, merge PDF, split PDF, compress PDF, convert PDF, Doczen';
  const locale = LOCALE_MAP[lang] || 'en_US';

  return (
    <Helmet>
      <html lang={lang} />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-tap-highlight" content="no" />

      <link rel="canonical" href={url} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={`${BASE_URL}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale} />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebApplication',
          name: pageTitle,
          url,
          description,
          image: `${BASE_URL}${image}`,
          author: { '@type': 'Organization', name: author },
          applicationCategory: 'WebApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
        })}
      </script>
    </Helmet>
  );
}
