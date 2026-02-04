import { Helmet } from 'react-helmet-async';

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
}: SEOProps) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteName = 'Brendoo';

  return (
    <Helmet>
      {/* Əsas Meta Tag-lar */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="az_AZ" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

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
    </Helmet>
  );
};

export default SEO;