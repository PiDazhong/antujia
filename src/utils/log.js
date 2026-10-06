import { API_BASE_URL } from '../config/uploadModules';

export const writeLog = (action, payload = {}) => {
  fetch(`${API_BASE_URL}/antujia-server/log/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  }).catch(() => {});
};

export const sendEmail = async (data) => {
  const response = await fetch(`${API_BASE_URL}/antujia-server/sendEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
};
