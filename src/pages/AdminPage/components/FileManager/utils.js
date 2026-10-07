// 多语言相关常量与工具：图片条目描述字段为 { zh, en, ar } 对象，存量字符串数据视为中文
export const EMPTY_LANG = { zh: '', en: '', ar: '' };

// 多语言字段兼容：存量字符串数据视为中文，对象原样取 zh/en/ar
export const normalizeLang = (value) => {
  if (typeof value === 'string') return { ...EMPTY_LANG, zh: value };
  return { ...EMPTY_LANG, ...(value || {}) };
};

// 卡片展示取中文
export const getLangText = (value) => (typeof value === 'string' ? value : value?.zh ?? '');
