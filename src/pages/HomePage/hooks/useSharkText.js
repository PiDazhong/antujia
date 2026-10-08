import { useHomeData } from '../context/HomeDataContext';
import { useLang } from '../../../context/LanguageContext';

/**
 * 按模块名取当前语言的文本条目
 * @param {string} module 模块名，如 'header'
 * @returns {Object} 以 sharkKey 为键、当前语言文本为值的对象，如 sharkObj[1]
 *
 * 用法：
 *   const sharkObj = useSharkText({ module: 'header' });
 *   <span>{sharkObj[1]}</span>  // 字标下标语
 */
const useSharkText = ({ module } = {}) => {
  const { modules } = useHomeData();
  const { lang } = useLang();

  const shark = modules[module]?.shark ?? {};
  return Object.fromEntries(
    Object.entries(shark).map(([key, texts]) => [key, texts?.[lang]])
  );
};

export default useSharkText;
