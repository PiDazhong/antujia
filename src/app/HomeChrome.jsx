'use client';

import { useEffect } from 'react';

// 首页客户端副作用：首屏大图预加载（原 App.jsx 中保留生效的逻辑）
const HomeChrome = () => {
  useEffect(() => {
    const img = new Image();
    img.src = 'https://saudi.damons.sa/icons/home/ç­å°2.1.jpg';
  }, []);

  return null;
};

export default HomeChrome;
