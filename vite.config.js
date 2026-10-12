import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'damonshome',
  },
  server: {
    proxy: {
      // 发邮件接口在 saudi-server（端口 3000），dev 下经 vite 代理转发：
      // 前端走相对路径 /saudi-server/...（同域，无 CORS 问题），与生产 nginx 代理模式一致
      '/saudi-server': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
