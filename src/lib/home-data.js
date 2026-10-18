import { API_ENDPOINTS } from '../config/uploadModules';
import { toSharkMap, toImageMap, toCodeTableMap } from './dataMaps';

/**
 * 首页服务端取数层 —— 仅在服务端执行（page.jsx 的 async Server Component 中调用），
 * 结果随 HTML 下发，HomeDataProvider 以 initialData 注入，客户端不再发请求。
 * 后端地址走 API_INTERNAL_URL（内网），与浏览器侧代理无关。
 */

// 服务端直连的后端地址（默认本机 3001，生产部署时指向内网地址）
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || 'http://localhost:3001';

const post = async (endpoint, body) => {
  const res = await fetch(`${API_INTERNAL_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
    // 后台 /manage 可编辑数据，不做缓存，每次 SSR 实时取
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || !data.success || data.code !== 1) {
    throw new Error(data.message || '请求失败');
  }
  return data.data ?? [];
};

// 首页渲染所需的全部模块（与各组件 useSharkText/useImage 的 module 参数一一对应）
export const HOME_MODULES = [
  'header',
  'heroImage',
  'whatcanidoforyou',
  'fullhomesolutions',
  'RiyadhManufacturingBase',
  'ourcapabilities',
  'OurItaliandesignteam',
  'green',
  'QualityContral',
  'formpanel',
  'aboutus',
];

// 单个模块：shark + image 并行，与客户端 HomeDataContext.ensureModule 结构一致
export const fetchModuleData = async (moduleName) => {
  const [shark, image] = await Promise.all([
    post(API_ENDPOINTS.sharkQuery(), { moduleName }).catch(() => []),
    post(API_ENDPOINTS.moduleQuery(), { moduleName }).catch(() => []),
  ]);
  return { shark: toSharkMap(shark), image: toImageMap(image) };
};

// 全量码表（codes 传空数组返回全量），单个失败不阻塞整页
export const fetchCodeTable = async () =>
  post(API_ENDPOINTS.codeTableQuery(), { codes: [] })
    .then((list) => toCodeTableMap(list))
    .catch(() => ({}));

// 首页全量数据：全部模块并行 + 码表
export const fetchHomeData = async () => {
  const pairs = await Promise.all(
    HOME_MODULES.map(async (name) => [name, await fetchModuleData(name)])
  );
  const codeTable = await fetchCodeTable();
  return {
    modules: Object.fromEntries(pairs),
    codeTable,
  };
};
