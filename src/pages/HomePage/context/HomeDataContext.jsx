import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/uploadModules';

/**
 * 首页数据上下文（懒加载版）
 * 不再挂载时全量预载所有模块，改为按模块名懒加载 + 缓存：
 * 哪个组件渲染了哪个模块，才请求哪个模块的数据（shark + image），
 * 隐私页只用 Header 时只会请求 header 一个模块
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

// 文本条目数组 → { [sharkKey]: sharkText }
const toSharkMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.sharkKey) acc[item.sharkKey] = item.sharkText ?? {};
    return acc;
  }, {});

// 图片条目数组 → { [fileId]: item }（string 键保留插入顺序）
const toImageMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.fileId) acc[item.fileId] = item;
    return acc;
  }, {});

// 码表条目数组 → { [code]: value }
const toCodeTableMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.code) acc[item.code] = item.value;
    return acc;
  }, {});

export const HomeDataProvider = ({ children }) => {
  const [modules, setModules] = useState({});
  const [codeTable, setCodeTable] = useState({});
  // 已请求（含进行中）的模块 / 码表，用于去重：true 表示无需再发请求
  const requestedModules = useRef({});
  const codeTableRequested = useRef(false);

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
