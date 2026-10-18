'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { LanguageProvider, useLang } from '../context/LanguageContext';

// antd 组件方向跟随语言（ar → rtl），/manage 后台页单独包 ltr（见 manage/page.jsx）
const Directional = ({ children }) => {
  const { lang } = useLang();
  return <ConfigProvider direction={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</ConfigProvider>;
};

// 根 Provider：antd CSS-in-JS SSR 样式抽取 + 多语言上下文 + 方向
export default function Providers({ children }) {
  return (
    <AntdRegistry>
      <LanguageProvider>
        <Directional>{children}</Directional>
      </LanguageProvider>
    </AntdRegistry>
  );
}
