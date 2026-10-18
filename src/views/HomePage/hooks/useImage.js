import { useEffect } from 'react';
import { useHomeData } from '../context/HomeDataContext';

/**
 * 按模块名取图片条目（模块数据懒加载，首次使用自动请求）
 * @param {string} module 模块名，如 'heroImage'
 * @returns {Object} 以 sort 为键、图片条目为值的对象，如 imgObj[1]
 *
 * 用法：
 *   const imgObj = useImage({ module: 'heroImage' });
 *   <img src={FILE_BASE_URL + imgObj[1]?.fileUrl} />  // sort=1 的背景图
 */
const useImage = ({ module } = {}) => {
  const { modules, ensureModule } = useHomeData();

  useEffect(() => {
    if (module) ensureModule(module);
  }, [module, ensureModule]);

  const image = modules[module]?.image ?? {};
  return Object.fromEntries(
    Object.entries(image).map(([, item]) => [item?.sort, item])
  );
};

export default useImage;
