import { Helmet } from 'react-helmet-async';
import GETRequest from '../../setting/Request';

/**
 * Robots.txt və Sitemap dinamik HTML head-ə əlavə et
 */
export default function SeoHead() {
  const { data: robotsTxt } = GETRequest<{ content: string }>(
    '/seo/robots',
    'seo-robots'
  );

  // Sitemap URL dinamik backend'dən
  const { data: sitemapData } = GETRequest<{ url: string; data?: { url: string } }>(
    '/seo/sitemap-index',
    'seo-sitemap-index'
  );

  // Backend'den gelen sitemap URL'sini al
  const sitemapUrl = sitemapData?.url || sitemapData?.data?.url;

  return (
    <Helmet>
      {/* Robots.txt */}
      {robotsTxt?.content && (
        <meta
          name="robots"
          content={robotsTxt.content}
        />
      )}

      {/* Sitemap Index - Dinamik backend URL'si */}
      <link rel="sitemap" type="application/xml" href={sitemapUrl || '/sitemap.xml'} />

      {/* Google Site Verification (optional) */}
      <meta name="google-site-verification" content="your-verification-code" />
      
      {/* Manifest */}
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to API */}
      <link rel="preconnect" href="https://admin.brendoo.com" />
      <link rel="dns-prefetch" href="https://admin.brendoo.com" />
    </Helmet>
  );
}
