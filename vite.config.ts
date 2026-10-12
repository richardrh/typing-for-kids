import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { staticSite } from './build/staticSite'
import { deploymentConfig } from './build/deployment'

const deployment = deploymentConfig()

// Match Netlify's /app/* history fallback in local dev and production preview.
function appHistoryFallback(base: string): Plugin {
  const install = (server: { middlewares: { use: (handler: (req: { url?: string; headers: { accept?: string } }, res: unknown, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, _res, next) => {
      const pathname = req.url?.split('?')[0] ?? ''
      const appPath = `${base}app`
      if ((pathname === appPath || pathname.startsWith(`${appPath}/`)) &&
          !pathname.split('/').pop()?.includes('.') && req.headers.accept?.includes('text/html')) {
        req.url = `${appPath}/index.html`
      }
      next()
    })
  }
  return { name: 'app-history-fallback', configureServer: install, configurePreviewServer: install }
}

export default defineConfig({
  appType: 'mpa',
  base: deployment.base,
  plugins: [vue(), appHistoryFallback(deployment.base), staticSite()],
  build: {
    rollupOptions: {
      input: {
        site: fileURLToPath(new URL('./index.html', import.meta.url)),
        app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
      },
    },
  },
})
