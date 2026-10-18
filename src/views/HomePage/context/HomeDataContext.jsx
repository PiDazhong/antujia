'use client';

import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/uploadModules';
import { toSharkMap, toImageMap, toCodeTableMap } from '../../../lib/dataMaps';

/**
 * 首页数据上下文（SSR 预取 + 懒加载兜底）
 * - SSR：page.jsx 服务端取数后通过 initialData 注入，客户端直接用、不重拉
 * - 兜底：未预取的模块仍走 ensureModule/ensureCodeTable 懒加载（去重防重复请求）
 * value 结构：
 *   modules: { [moduleName]: { shark: { [sharkKey]: sharkText }, image: { [fileId]: item } } }
 *     - shark：以 sharkKey 为键，值为多语言对象 { zh, en, ar }
 *     - image：以 fileId 为键，值为图片条目（保留接口返回顺序，展示时 Object.values 即可）
 *   codeTable：全量码表映射 { [code]: value }，首次有组件调用 ensureCodeTable 时才请求
 *   ensureModule(moduleName)：请求并缓存指定模块（重复调用自动去重）
 *   ensureCodeTable()：请求并缓存全量码表（重复调用自动去重）
 */
const HomeDataContext = createContext({
  modules: {},
  codeTable: {},
  ensureModule: () => {},
  ensureCodeTable: () => {},
});

const post = async (endpoint, body) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success || data.code !== 1) {
    throw new Error(data.message || '请求失败');
  }
  return data.data ?? [];
};

export const HomeDataProvider = ({ children, initialData }) => {
  const [modules, setModules] = useState(initialData?.modules ?? {});
  const [codeTable, setCodeTable] = useState(initialData?.codeTable ?? {});
  // 已请求（含进行中）的模块 / 码表，用于去重：true 表示无需再发请求
  // SSR 已预取的部分一并标记，客户端不再重拉
  const requestedModules = useRef(
    Object.fromEntries(Object.keys(initialData?.modules ?? {}).map((k) => [k, true]))
  );
  const codeTableRequested = useRef(Boolean(initialData?.codeTable));

  // 按模块名懒加载：shark + image 并行，单个失败不阻塞，去重防止 StrictMode 双调用重复请求
  const ensureModule = useCallback((moduleName) => {
    if (!moduleName || requestedModules.current[moduleName]) return;
    requestedModules.current[moduleName] = true;
    Promise.all([
      post(API_ENDPOINTS.sharkQuery(), { moduleName }).catch(() => []),
      post(API_ENDPOINTS.moduleQuery(), { moduleName }).catch(() => []),
    ]).then(([shark, image]) => {
      setModules((prev) => ({
        ...prev,
        [moduleName]: { shark: toSharkMap(shark), image: toImageMap(image) },
      }));
    });
  }, []);

  // 全量码表懒加载（codes 传空数组返回全量）
  const ensureCodeTable = useCallback(() => {
    if (codeTableRequested.current) return;
    codeTableRequested.current = true;
    post(API_ENDPOINTS.codeTableQuery(), { codes: [] })
      .then((list) => setCodeTable(toCodeTableMap(list)))
      .catch(() => {});
  }, []);

  return (
    <HomeDataContext.Provider value={{ modules, codeTable, ensureModule, ensureCodeTable }}>
      {children}
    </HomeDataContext.Provider>
  );
};

export const useHomeData = () => useContext(HomeDataContext);
