import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/storage': {
        target: 'https://admin.brendoo.com',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: 'https://admin.brendoo.com/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/sitemap.xml', '/seo/sitemap')
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'swiper', 'swiper/react', '@tanstack/react-query'],
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['swiper', 'lucide-react', 'react-icons'],
          'form-vendor': ['formik', 'yup'],
        },
      },
    },
  },
});