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
// 开发环境直连 3000 跨端口请求（后端需放行 CORS）；生产环境改为相对路径前需确认部署方式
const MAIL_API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

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
