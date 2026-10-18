'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { writeLog } from '../utils/log';

// 页面浏览埋点：路由切换时上报（/manage 后台除外），替代原 App.jsx 的 location effect
const ViewLog = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/manage') {
      writeLog('view');
    }
  }, [pathname]);

  return null;
};

export default ViewLog;
