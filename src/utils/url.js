/**
 * URL 工具
 */

/**
 * 外链补全协议：码表等配置里可能填 www.xxx.com / wa.me/xxx 这类不带协议的地址，
 * 直接 window.open / <a href> 会被当成相对路径拼到当前域名后面，
 * 统一补 https:// 前缀；已带协议头（http:、https:、whatsapp:、tel:、mailto: 等）的原样返回
 * @param {string} url
 * @returns {string} 补全后的地址；入参为空返回空字符串
 */
export const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
