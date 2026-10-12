import { API_BASE_URL } from '../config/uploadModules';

export const writeLog = (action, payload = {}) => {
  fetch(`${API_BASE_URL}/damonshome-server/log/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  }).catch(() => {});
};

export const sendEmail = async (data) => {
  const response = await fetch(`${API_BASE_URL}/damonshome-server/sendEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
};

// 发邮件接口部署在另一个本地服务（saudi-server，端口 3000），与本项目主后端（3001）不同
// dev 走相对路径 /saudi-server/...，由 vite proxy / nginx 转发到 3000（见 vite.config.js / nginx.conf）
// 生产构建产物部署在 damons-home.damons.sa，如需发信要在该域名的 nginx 上加 /saudi-server/ 代理
const MAIL_API_BASE_URL = '';

export const sendMail = async (data) => {
  const response = await fetch(`${MAIL_API_BASE_URL}/saudi-server/sendEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
};
