import https from 'node:https'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only middleware that proxies /zendesk-proxy requests to the Zendesk API,
// bypassing browser CORS restrictions. Uses Node's built-in https module for
// compatibility with all Node.js versions.
function zendeskProxyPlugin() {
  return {
    name: 'zendesk-cors-proxy',
    configureServer(server) {
      server.middlewares.use('/zendesk-proxy', (req, res) => {
        try {
          const parsed = new URL(req.url, 'http://localhost')
          const targetUrl = parsed.searchParams.get('url')

          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing ?url= parameter' }))
            return
          }

          const dest = new URL(targetUrl)
          const proxyReq = https.request(
            {
              hostname: dest.hostname,
              path: dest.pathname + dest.search,
              method: req.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization
                  ? { Authorization: req.headers.authorization }
                  : {}),
              },
            },
            (proxyRes) => {
              const fwdHeaders = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
              for (const h of ['x-rate-limit', 'x-rate-limit-remaining', 'retry-after']) {
                if (proxyRes.headers[h]) fwdHeaders[h] = proxyRes.headers[h]
              }

              res.writeHead(proxyRes.statusCode, fwdHeaders)
              proxyRes.pipe(res)
            },
          )

          proxyReq.on('error', (err) => {
            console.error('[zendesk-proxy] Request error:', err.message)
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
            }
            res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }))
          })

          proxyReq.end()
        } catch (err) {
          console.error('[zendesk-proxy] Error:', err.message)
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
          }
          res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }))
        }
      })
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), zendeskProxyPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
})
