import { useState, useEffect, useCallback } from 'react';
import { message, Spin, Modal, Input, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ModuleItem from './ModuleItem';
import ModuleUploadManager from './ModuleUploadManager';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../config/uploadModules';
import { authFetch } from '../../../../utils/authFetch';

// 模块名校验：仅允许英文、数字、下划线
const MODULE_NAME_PATTERN = /^[A-Za-z0-9_]+$/;

// 文件管理：模块列表取自码表 moudle，左侧导航支持新增/删除，右侧管理各模块图片
/* eslint-disable react/prop-types */
const FileManager = ({ active }) => {
  const [modules, setModules] = useState([]);
  const [activeKey, setActiveKey] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addValue, setAddValue] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleList()}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取模块列表失败');
      }
      const list = Array.isArray(data.data) ? data.data : [];
      setModules(list);
      setActiveKey((prev) => (list.includes(prev) ? prev : list[0]));
    } catch (err) {
      message.error(`获取模块列表失败: ${err.message}`);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次挂载及 tab 每次变为可见时重新拉取模块列表
  useEffect(() => {
    if (active) fetchModules();
  }, [active, fetchModules]);

  const openAddModal = () => {
    setAddValue('');
    setAddOpen(true);
  };

  const handleAdd = async () => {
    const name = addValue.trim();
    if (!MODULE_NAME_PATTERN.test(name)) {
      message.error('模块名只能为英文、数字和下划线');
      return;
    }
    setAddLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleCreate()}`, {
        method: 'POST',
        body: { moduleName: name },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '新增模块失败');
      }
      message.success('模块新增成功');
      setAddOpen(false);
      await fetchModules();
      setActiveKey(name);
    } catch (err) {
      message.error(`新增模块失败: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteModule = async (name) => {
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleDelete()}`, {
        method: 'POST',
        body: { moduleName: name },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '删除模块失败');
      }
      message.success('模块已删除');
      await fetchModules();
    } catch (err) {
      message.error(`删除模块失败: ${err.message}`);
    }
  };

  const currentModule = modules.includes(activeKey) ? activeKey : null;

  return (
    <div className="manager-panel file-manager-panel">
      <Spin spinning={loading}>
        <div className="module-layout">
          <div className="module-rail">
            <div className="module-rail-list">
              {modules.map((name) => (
                <ModuleItem
                  key={name}
                  name={name}
                  active={name === currentModule}
                  onSelect={() => setActiveKey(name)}
                  onDelete={() => handleDeleteModule(name)}
                />
              ))}
            </div>
            <button type="button" className="module-add-btn" onClick={openAddModal}>
              <PlusOutlined />
              新增模块
            </button>
          </div>
          <div className="module-content">
            {currentModule ? (
              <ModuleUploadManager moduleName={currentModule} active={active} />
            ) : (
              !loading && <Empty description="暂无模块，请点击左侧「新增模块」创建" />
            )}
          </div>
        </div>
      </Spin>

      <Modal
        title="新增模块"
        open={addOpen}
        onOk={handleAdd}
        onCancel={() => setAddOpen(false)}
        okText="确定"
        cancelText="取消"
        confirmLoading={addLoading}
        destroyOnHidden
      >
        <Input
          placeholder="请输入模块名（仅英文、数字、下划线）"
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          onPressEnter={handleAdd}
          allowClear
        />
      </Modal>
    </div>
  );
};

export default FileManager;
