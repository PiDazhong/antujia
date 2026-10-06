import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import FileManager from './components/FileManager';
import CodeTableManager from './components/CodeTableManager';
import './index.less';

const AdminPage = () => {
  // 顶部吸顶 Tabs 需要避让 sticky 的站点头部，动态测量头部高度
  const [tabsTop, setTabsTop] = useState(0);

  useEffect(() => {
    const update = () => {
      const header = document.querySelector('.site-header');
      setTabsTop(header ? header.offsetHeight : 0);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="admin-page" style={{ '--admin-tabs-top': `${tabsTop}px` }}>
      <Tabs
        defaultActiveKey="files"
        className="admin-tabs"
        items={[
          { key: 'files', label: '文件管理', children: <FileManager /> },
          { key: 'code', label: '信息管理', children: <CodeTableManager /> },
        ]}
      />
    </div>
  );
};

export default AdminPage;
