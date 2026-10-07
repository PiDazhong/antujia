/**
 * 登录 token 管理 + 统一请求封装
 * 后端登录成功后返回 JWT，前端存 sessionStorage（关浏览器即失效）
 * 所有管理端请求必须走 authFetch 携带 Authorization 头
 */

const TOKEN_KEY = 'auth_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

/**
 * 管理端请求封装：自动携带 Bearer token、JSON 序列化 body（FormData 除外）
 * 返回 401 时清除 token 并刷新页面回到登录守卫
 * 注意：登录接口（login）本身可能返回 401（密码错误），不要用这个封装
 */
export async function authFetch(url, options = {}) {
  const { body, headers = {}, ...rest } = options;

  const finalHeaders = { ...headers };
  const token = getToken();
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    if (!finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    finalBody = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, { ...rest, headers: finalHeaders, body: finalBody });

  if (res.status === 401) {
    clearToken();
    // 管理端请求只在 /manage、/analysis 下发出，401 说明 token 失效，回到登录页
    window.location.reload();
  }

  return res;
}
