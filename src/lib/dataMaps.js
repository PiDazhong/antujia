/**
 * 接口数据 → 组件消费结构的映射函数
 * 服务端（src/lib/home-data.js 预取）与客户端（HomeDataContext 懒加载兜底）共用
 */

// 文本条目数组 → { [sharkKey]: sharkText }
export const toSharkMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.sharkKey) acc[item.sharkKey] = item.sharkText ?? {};
    return acc;
  }, {});

// 图片条目数组 → { [fileId]: item }（string 键保留插入顺序，展示时 Object.values 即可）
export const toImageMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.fileId) acc[item.fileId] = item;
    return acc;
  }, {});

// 码表条目数组 → { [code]: value }
export const toCodeTableMap = (list) =>
  (Array.isArray(list) ? list : []).reduce((acc, item) => {
    if (item?.code) acc[item.code] = item.value;
    return acc;
  }, {});
