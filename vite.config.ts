import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const googleVerification = env.VITE_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'optional-google-site-verification',
        transformIndexHtml() {
          if (!googleVerification) return [];
          return [{
            tag: 'meta',
            attrs: { name: 'google-site-verification', content: googleVerification },
            injectTo: 'head',
          }];
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) return 'framework';
            if (id.includes('node_modules/lucide-react/')) return 'icons';
            return undefined;
          },
        },
      },
    },
  };
});
