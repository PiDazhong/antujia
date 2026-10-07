/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../config/uploadModules';
import { authFetch } from '../../../../utils/authFetch';

// 密码仅允许数字、字母、下划线（与后端 passwordStore.PASSWORD_PATTERN 保持一致）
const PASSWORD_PATTERN = /^[A-Za-z0-9_]+$/;

// 登录管理：维护后端 password.json（[{ password, desc }]），与信息管理类似但无拖拽排序
const PasswordManager = ({ active }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.passwordQuery()}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '查询失败');
      }
      const arr = Array.isArray(data.data) ? data.data : [];
      setList(arr.map((item, index) => ({ ...item, key: item.password ?? `row-${index}` })));
    } catch (err) {
      message.error(`查询登录密码失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次挂载及 tab 每次变为可见时重新拉取，保证看到的是最新数据
  useEffect(() => {
    if (active) fetchList();
  }, [active, fetchList]);

  const handleAdd = () => {
    setList((prev) => [
      ...prev,
      { password: '', desc: '', key: `draft-${Date.now()}`, isNew: true },
    ]);
  };

  const handleChange = (index, field, value) => {
    setList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // 删除：已保存的行调用 /delete（最后一条服务端会拒绝），未保存的草稿行直接移除
  const handleDelete = async (index) => {
    const item = list[index];
    if (!item.isNew && item.password) {
      try {
        const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.passwordDelete()}`, {
          method: 'POST',
          body: { password: item.password },
        });
        const data = await res.json();
        if (!res.ok || !data.success || data.code !== 1) {
          throw new Error(data.message || '删除失败');
        }
        message.success('删除成功');
      } catch (err) {
        message.error(`删除失败: ${err.message}`);
        return;
      }
      await fetchList();
      return;
    }
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  // 保存：批量调用 /save，整表替换
  const handleSave = async () => {
    const passwords = list.map((item) => (item.password || '').trim());
    if (passwords.some((p) => !p)) {
      message.error('密码不能为空');
      return;
    }
    const invalid = passwords.find((p) => !PASSWORD_PATTERN.test(p));
    if (invalid) {
      message.error(`密码 "${invalid}" 不合法，仅限数字、字母、下划线`);
      return;
    }
    if (new Set(passwords).size !== passwords.length) {
      message.error('密码不能重复');
      return;
    }
    if (list.length === 0) {
      message.error('至少保留一条登录密码');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.passwordSave()}`, {
        method: 'POST',
        body: {
          items: list.map((item) => ({
            password: item.password.trim(),
            desc: (item.desc || '').trim(),
          })),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '保存失败');
      }
      message.success('保存成功');
      await fetchList();
    } catch (err) {
      message.error(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manager-panel code-table-panel password-manager-panel">
      <div className="code-table-toolbar">
        <div className="toolbar-title">
          <p>密码仅限数字、字母、下划线；保存后生效，删除密码会使对应登录状态立即失效</p>
        </div>
        <div className="toolbar-actions">
          <Button icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
      <Spin spinning={loading}>
        <div className="code-table-manager">
          <div className="code-table-header password-table-header">
            <span className="code-table-col sort-col">序号</span>
            <span className="code-table-col">密码</span>
            <span className="code-table-col">说明</span>
            <span className="code-table-col action-col">操作</span>
          </div>
          <div className="code-table-body">
            {list.map((item, index) => (
              <div
                key={item.key}
                className={`code-table-row${item.isNew ? ' draft-row' : ''}`}
              >
                <div className="code-table-col sort-col">
                  <span className="sort-text">{index + 1}</span>
                </div>
                <div className="code-table-col">
                  <Input
                    variant="filled"
                    placeholder="请输入密码（数字、字母、下划线）"
                    value={item.password}
                    disabled={!item.isNew}
                    onChange={(e) => handleChange(index, 'password', e.target.value)}
                  />
                </div>
                <div className="code-table-col">
                  <Input
                    variant="filled"
                    placeholder="请输入说明"
                    value={item.desc}
                    onChange={(e) => handleChange(index, 'desc', e.target.value)}
                  />
                </div>
                <div className="code-table-col action-col">
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(index)}
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="code-table-empty">暂无数据，请点击右上角「新增」创建</div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default PasswordManager;
