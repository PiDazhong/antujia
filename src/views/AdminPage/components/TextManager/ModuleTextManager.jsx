import { useState, useEffect, useCallback } from 'react';
import { message, Spin, Modal, Input, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableSharkCard from './SortableSharkCard';
import SharkCardContent from './SharkCardContent';
import { EMPTY_LANG, normalizeLang } from '../FileManager/utils';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../config/uploadModules';
import { authFetch } from '../../../../utils/authFetch';

// 多语言输入项：中文 / 英文 / 阿语
const LANG_INPUTS = [
  { lang: 'zh', label: '中文' },
  { lang: 'en', label: '英文' },
  { lang: 'ar', label: '阿语' },
];

// 多语言文本输入组：中文 / 英文 / 阿语三行，与图片管理的 LangInputGroup 保持一致（prefix 语言标识）
/* eslint-disable react/prop-types */
const SharkTextInputGroup = ({ value, onChange, placeholders }) => (
  <div className="lang-input-group">
    {LANG_INPUTS.map(({ lang, label }, index) => (
      <Input
        key={lang}
        prefix={<span className="lang-tag">{label}</span>}
        placeholder={placeholders[index]}
        value={value[lang]}
        onChange={(e) => onChange((prev) => ({ ...prev, [lang]: e.target.value }))}
        allowClear
      />
    ))}
  </div>
);

// 右侧文本条目管理：按 /shark/query 返回的对象数组渲染文本格子
/* eslint-disable react/prop-types */
const ModuleTextManager = ({ moduleName, active }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingKey, setEditingKey] = useState(null);
  const [sharkKey, setSharkKey] = useState('');
  const [sharkText, setSharkText] = useState(EMPTY_LANG);
  const [submitting, setSubmitting] = useState(false);
  const sensors = useSensors(
    // distance 约束：小于 5px 的位移视为点击，不影响点按操作
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.sharkQuery()}`, {
        method: 'POST',
        body: { moduleName },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取文本列表失败');
      }
      const listData = data.data ?? [];
      setItems(Array.isArray(listData) ? listData : []);
    } catch (err) {
      message.error(`获取文本列表失败: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [moduleName]);

  // 首次挂载及所属 tab 每次变为可见时重新拉取，保证看到的是最新数据
  useEffect(() => {
    if (active) fetchItems();
  }, [active, fetchItems]);

  const resetModalForm = () => {
    setSharkKey('');
    setSharkText(EMPTY_LANG);
    setEditingKey(null);
    setModalMode('add');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetModalForm();
  };

  const openAddModal = () => {
    resetModalForm();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingKey(item.sharkKey);
    setSharkKey(item.sharkKey);
    setSharkText(normalizeLang(item.sharkText));
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.sharkDelete()}`, {
        method: 'POST',
        body: { moduleName, sharkKey: item.sharkKey },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '删除失败');
      }
      message.success('已删除');
      fetchItems();
    } catch (err) {
      message.error(`删除失败: ${err.message}`);
    }
  };

  // 新增：sharkKey 同模块内唯一，sharkText 可选（服务端为空时返回占位文本）
  const handleAdd = async () => {
    const key = sharkKey.trim();
    if (!key) {
      message.error('请输入 sharkKey');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.sharkAdd()}`, {
        method: 'POST',
        body: {
          moduleName,
          sharkKey: key,
          sharkText: {
            zh: sharkText.zh.trim(),
            en: sharkText.en.trim(),
            ar: sharkText.ar.trim(),
          },
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '新增失败');
      }
      message.success('新增成功');
      closeModal();
      fetchItems();
    } catch (err) {
      message.error(`新增失败: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 编辑：sharkKey 不可修改，仅更新 sharkText（多语言对象）
  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.sharkEdit()}`, {
        method: 'POST',
        body: {
          moduleName,
          sharkKey: editingKey,
          sharkText: {
            zh: sharkText.zh.trim(),
            en: sharkText.en.trim(),
            ar: sharkText.ar.trim(),
          },
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '保存失败');
      }
      message.success('已保存');
      closeModal();
      fetchItems();
    } catch (err) {
      message.error(`保存失败: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 拖拽松开后调用 /shark/sort，按 sharkKeys 顺序重排并重算 sort
  const persistSort = async (next) => {
    const prevItems = items;
    setItems(next);
    setSorting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.sharkSort()}`, {
        method: 'POST',
        body: {
          moduleName,
          sharkKeys: next.map((item) => item.sharkKey),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '排序失败');
      }
      message.success('排序已保存');
    } catch (err) {
      setItems(prevItems);
      message.error(`排序失败: ${err.message}`);
    } finally {
      setSorting(false);
    }
  };

  const getItemKey = (item) => item.sharkKey;

  const handleDragStart = (event) => {
    const item = items.find((entry) => getItemKey(entry) === event.active.id);
    setActiveDragItem(item || null);
  };

  const handleDragEnd = (event) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => getItemKey(item) === active.id);
    const newIndex = items.findIndex((item) => getItemKey(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    persistSort(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div className="module-text-manager">
      <Spin spinning={loading || sorting}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)}
        >
          <div className="shark-card-grid">
            <SortableContext items={items.map(getItemKey)} strategy={rectSortingStrategy}>
              {items.map((item) => (
                <SortableSharkCard
                  key={getItemKey(item)}
                  item={item}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
            <div className="shark-card shark-card-add" onClick={openAddModal}>
              <PlusOutlined className="shark-card-add-icon" />
              <span className="shark-card-add-text">新增文本</span>
            </div>
          </div>
          <DragOverlay>
            {activeDragItem ? (
              <div className="shark-card shark-card-overlay">
                <SharkCardContent
                  item={activeDragItem}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Spin>

      <Modal
        title={modalMode === 'edit' ? '编辑文本' : '新增文本'}
        open={modalOpen}
        onOk={modalMode === 'edit' ? handleEdit : handleAdd}
        onCancel={closeModal}
        okText="确定"
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnHidden
        centered
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
        <div className="text-manage-modal">
          <Form layout="vertical">
            <Form.Item label="sharkKey" required>
              <Input
                placeholder="请输入 sharkKey（同模块内唯一）"
                value={sharkKey}
                onChange={(e) => setSharkKey(e.target.value)}
                onPressEnter={modalMode === 'edit' ? handleEdit : handleAdd}
                disabled={modalMode === 'edit'}
                allowClear={modalMode === 'add'}
              />
            </Form.Item>
            <Form.Item label="shark文本">
              <SharkTextInputGroup
                value={sharkText}
                onChange={setSharkText}
                placeholders={[
                  '请输入中文文本（选填）',
                  '请输入英文文本（选填）',
                  '请输入阿语文本（选填）',
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ModuleTextManager;
