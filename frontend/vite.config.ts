import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ''),
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rid = (req.headers['x-request-id'] as string) || undefined
            const auth = (req.headers['authorization'] as string) || undefined
            if (rid) proxyReq.setHeader('x-request-id', rid)
            if (auth) proxyReq.setHeader('authorization', auth)
          })
        },
      },
    },
  },
})
