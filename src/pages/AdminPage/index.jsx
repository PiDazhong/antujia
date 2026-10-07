import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import FileManager from './components/FileManager';
import TextManager from './components/TextManager';
import CodeTableManager from './components/CodeTableManager';
import './index.less';

const AdminPage = () => {
  // 顶部吸顶 Tabs 需要避让 sticky 的站点头部，动态测量头部高度
  const [tabsTop, setTabsTop] = useState(0);
  // 受控激活 tab，向两个面板下发 active，实现「tab 可见时重新拉取数据」
  const [activeKey, setActiveKey] = useState('files');

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
        activeKey={activeKey}
        onChange={setActiveKey}
        className="admin-tabs"
        destroyOnHidden={false}
        items={[
          // forceRender：首次挂载后保留节点，切换 tab 不再重新挂载导致状态/请求丢失
          { key: 'files', label: '文件管理', children: <FileManager active={activeKey === 'files'} />, forceRender: true },
          { key: 'texts', label: '文本管理', children: <TextManager active={activeKey === 'texts'} />, forceRender: true },
          { key: 'code', label: '信息管理', children: <CodeTableManager active={activeKey === 'code'} />, forceRender: true },
        ]}
      />
    </div>
  );
};

export default AdminPage;
