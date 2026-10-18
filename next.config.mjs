/** @type {import('next').NextConfig} */
// 后端内网地址（服务端取数用，不暴露给客户端）：开发默认本机 3001
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || 'http://localhost:3001';
// 发邮件服务（saudi-server，端口 3000），同原 vite proxy 配置
const MAIL_INTERNAL_URL = process.env.MAIL_INTERNAL_URL || 'http://localhost:3000';

const nextConfig = {
  reactStrictMode: true,
  // 存量代码未按 react/prop-types 等规则整改，构建期不做 lint 拦截（lint 仍可单独 npm run lint 执行）
  eslint: { ignoreDuringBuilds: true },
  // 产出独立 Node 服务（.next/standalone），便于线上以进程方式部署
  output: 'standalone',
  async rewrites() {
    // 开发模式下把相对路径代理到本地后端，与生产 nginx 代理模式一致；
    // 生产由 nginx 代理 /damonshome-server、/damonshome、/saudi-server，不走这里
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      { source: '/damonshome-server/:path*', destination: `${API_INTERNAL_URL}/damonshome-server/:path*` },
      { source: '/damonshome/:path*', destination: `${API_INTERNAL_URL}/damonshome/:path*` },
      { source: '/saudi-server/:path*', destination: `${MAIL_INTERNAL_URL}/saudi-server/:path*` },
    ];
  },
};

export default nextConfig;
