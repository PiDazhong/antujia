import { useEffect } from 'react';
import { useHomeData } from '../context/HomeDataContext';

/**
 * 取全量码表映射（懒加载，首次使用自动请求）
 * @returns {Object} 以 code 为键、value 为值的对象，如 codeTable.whatsAppLink
 *
 * 用法：
 *   const codeTable = useCodeTable();
 *   const whatsappUrl = toAbsoluteUrl(codeTable.whatsAppLink);
 */
const useCodeTable = () => {
  const { codeTable, ensureCodeTable } = useHomeData();

  useEffect(() => {
    ensureCodeTable();
  }, [ensureCodeTable]);

  return codeTable;
};

export default useCodeTable;
