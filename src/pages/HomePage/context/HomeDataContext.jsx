import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/uploadModules';

/**
 * 首页数据上下文
 * 挂载时先拉模块列表，再按模块名并行拉取图片条目（module/query）和文本条目（module/shark/query）
 * value 结构：{ [moduleName]: { shark: { [sharkKey]: sharkText }, image: { [fileId]: item } } }
 *   - shark：以 sharkKey 为键，值为多语言对象 { zh, en, ar }
 *   - image：以 fileId 为键，值为图片条目（保留接口返回顺序，展示时 Object.values 即可）
 */
const HomeDataContext = createContext({
  modules: {},
  loading: true,
  error: null,
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

export const HomeDataProvider = ({ children }) => {
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. 拉模块列表
        const list = await post(API_ENDPOINTS.moduleList());
        const moduleNames = (Array.isArray(list) ? list : [])
          .map((m) => (typeof m === 'string' ? m : m?.moduleName))
          .filter(Boolean);

        // 2. 按模块名并行拉 shark + image，单个模块失败不阻塞整体
        const results = await Promise.all(
          moduleNames.map(async (moduleName) => {
            const [shark, image] = await Promise.all([
              post(API_ENDPOINTS.sharkQuery(), { moduleName }).catch(() => []),
              post(API_ENDPOINTS.moduleQuery(), { moduleName }).catch(() => []),
            ]);
            return [moduleName, { shark: toSharkMap(shark), image: toImageMap(image) }];
          })
        );

        if (!cancelled) {
          setModules(Object.fromEntries(results));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  console.log('modules', modules);

  return (
    <HomeDataContext.Provider value={{ modules, loading, error }}>
      {children}
    </HomeDataContext.Provider>
  );
};

export const useHomeData = () => useContext(HomeDataContext);
