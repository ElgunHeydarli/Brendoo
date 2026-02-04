import { Helmet } from 'react-helmet-async';
import type { SeoMeta } from '../../setting/Types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
  brand?: string;
  noindex?: boolean;
  seoData?: SeoMeta;
}

const SEO = ({
  title = 'Brendoo - Premium brendlərdən orijinal məhsullar',
  description = 'Brendoo - Azərbaycanda premium brendlərdən orijinal geyim və aksesuarlar. Sürətli çatdırılma, keyfiyyət zəmanəti.',
  keywords = 'brendoo, geyim, moda, online mağaza, premium brend, azərbaycan',
  image = 'https://brendoo.com/og-image.jpg',
  url,
  type = 'website',
  price,
  currency = 'AZN',
  availability,
  brand,
  noindex = false,
  seoData,
}: SEOProps) => {
  const fallbackUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonicalUrl = seoData?.canonical || fallbackUrl;
  const resolvedTitle = seoData?.title || title;
  const resolvedDescription = seoData?.description || description;
  const resolvedKeywords = seoData?.keywords || keywords;
  const resolvedRobots = seoData?.robots || (noindex ? 'noindex, nofollow' : undefined);
  const hasOg = seoData?.og && Object.keys(seoData.og).length > 0;
  const hasTwitter = seoData?.twitter && Object.keys(seoData.twitter).length > 0;
  const siteName = 'Brendoo';

  return (
    <Helmet>
      {/* Əsas Meta Tag-lar */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      {resolvedRobots && <meta name="robots" content={resolvedRobots} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      {hasOg ? (
        Object.entries(seoData?.og || {}).map(([key, value]) => (
          <meta property={key} content={value} key={`og-${key}`} />
        ))
      ) : (
        <>
          <meta property="og:type" content={type} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:title" content={resolvedTitle} />
          <meta property="og:description" content={resolvedDescription} />
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content={siteName} />
          <meta property="og:locale" content="az_AZ" />
          <meta property="og:locale:alternate" content="en_US" />
        </>
      )}

      {/* Twitter Card */}
      {hasTwitter ? (
        Object.entries(seoData?.twitter || {}).map(([key, value]) => (
          <meta name={key} content={value} key={`tw-${key}`} />
        ))
      ) : (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={canonicalUrl} />
          <meta name="twitter:title" content={resolvedTitle} />
          <meta name="twitter:description" content={resolvedDescription} />
          <meta name="twitter:image" content={image} />
        </>
      )}

      {/* Alternates */}
      {seoData?.alternates?.map((alt) => (
        <link rel="alternate" hrefLang={alt.hreflang} href={alt.href} key={alt.hreflang} />
      ))}

      {/* Product-specific (e-commerce) */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          {availability && (
            <meta property="product:availability" content={availability} />
          )}
          {brand && <meta property="product:brand" content={brand} />}
        </>
      )}

      {/* Additional SEO */}
      <meta name="author" content="Brendoo" />
      <meta name="publisher" content="Brendoo" />
      <meta name="theme-color" content="#3873C3" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Schema.org JSON-LD */}
      {seoData?.schema && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;