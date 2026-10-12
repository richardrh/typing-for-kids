import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { staticSite } from './build/staticSite'

// Match Netlify's /app/* history fallback in local dev and production preview.
function appHistoryFallback(): Plugin {
  const install = (server: { middlewares: { use: (handler: (req: { url?: string; headers: { accept?: string } }, res: unknown, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, _res, next) => {
      const pathname = req.url?.split('?')[0] ?? ''
      if ((pathname === '/app' || pathname.startsWith('/app/')) &&
          !pathname.split('/').pop()?.includes('.') && req.headers.accept?.includes('text/html')) {
        req.url = '/app/index.html'
      }
      next()
    })
  }
  return { name: 'app-history-fallback', configureServer: install, configurePreviewServer: install }
}

export default defineConfig({
  appType: 'mpa',
  plugins: [vue(), appHistoryFallback(), staticSite()],
  build: {
    rollupOptions: {
      input: {
        site: fileURLToPath(new URL('./index.html', import.meta.url)),
        app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
      },
    },
  },
})
