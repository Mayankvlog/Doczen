import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://doczen.app';
const SITE_NAME = 'Doczen';
const DEFAULT_DESC = 'Doczen - Free Online PDF Editor. Merge, split, compress, convert and edit PDF files online for free. No installation required.';

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
  const pageTitle = title ? `${title} | Doczen - Free Online PDF Editor` : `${SITE_NAME} - Free Online PDF Editor`;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const pageKeywords = keywords
    ? `${keywords}, PDF editor, online PDF, free PDF tools, Doczen`
    : 'PDF editor, online PDF, free PDF tools, merge PDF, split PDF, compress PDF, convert PDF, Doczen';

  return (
    <Helmet>
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
      <meta property="og:locale" content="en_US" />

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
