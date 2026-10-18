'use client';

import { useEffect } from 'react';

// 首页客户端副作用：首屏大图预加载（原 App.jsx 中保留生效的逻辑）
const HomeChrome = () => {
  useEffect(() => {
    const img = new Image();
    img.src = '/damonshome/heroImage/49efe453-630c-4df5-9647-dc3af3fd2161.jpg';
  }, []);

  return null;
};

export default HomeChrome;
