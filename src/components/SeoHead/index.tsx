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

  const { data: sitemapIndex } = GETRequest<{ url: string }>(
    '/seo/sitemap-index',
    'seo-sitemap-index'
  );

  return (
    <Helmet>
      {/* Robots.txt */}
      {robotsTxt?.content && (
        <meta
          name="robots"
          content={robotsTxt.content}
        />
      )}

      {/* Sitemap Index */}
      {sitemapIndex?.url && (
        <link rel="sitemap" type="application/xml" href={sitemapIndex.url} />
      )}

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
