import { useState, useEffect, useCallback } from 'react';
import { message, Spin, Popconfirm, Modal, Input, Empty, Upload, Form } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined, HolderOutlined, LoadingOutlined } from '@ant-design/icons';
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
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/uploadModules';

// 模块名校验：仅允许英文、数字、下划线
const MODULE_NAME_PATTERN = /^[A-Za-z0-9_]+$/;

const EMPTY_LANG = { zh: '', en: '', ar: '' };

// 多语言字段兼容：存量字符串数据视为中文，对象原样取 zh/en/ar
const normalizeLang = (value) => {
  if (typeof value === 'string') return { ...EMPTY_LANG, zh: value };
  return { ...EMPTY_LANG, ...(value || {}) };
};

// 卡片展示取中文
const getLangText = (value) => (typeof value === 'string' ? value : value?.zh ?? '');

// 图片卡片内容（拖拽悬浮层也复用这份渲染）
/* eslint-disable react/prop-types */
const CardContent = ({ item, imageUrl, onPreview, onEdit, onDelete, handleListeners }) => (
  <>
    <span className="image-card-handle" title="拖拽排序" {...handleListeners}>
      <HolderOutlined />
    </span>
    <div className="image-card-img" onClick={() => onPreview(item)}>
      <img src={imageUrl} alt={item.fileName || ''} onError={(e) => { e.target.style.display = 'none'; }} />
      <div className="image-card-actions" onClick={(e) => e.stopPropagation()}>
        <EditOutlined
          className="image-card-action-btn"
          onClick={() => onEdit(item)}
        />
        <Popconfirm
          title="确认删除"
          description="确定要删除该图片条目吗？"
          onConfirm={() => onDelete(item)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <DeleteOutlined className="image-card-action-btn danger" />
        </Popconfirm>
      </div>
    </div>
    <div className="image-card-info">
      <span className="image-card-desc">{getLangText(item.fileDesc)}</span>
      <span className="image-card-subdesc">{getLangText(item.fileSubDesc)}</span>
    </div>
  </>
);

// 可排序图片卡片：整卡响应拖拽，其他卡片由 SortableContext 平滑让位
/* eslint-disable react/prop-types */
const SortableImageCard = ({ item, imageUrl, onPreview, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.fileId || item.fileUrl || item.fileName,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`image-card${isDragging ? ' row-hidden' : ''}`}
      {...attributes}
    >
      <CardContent
        item={item}
        imageUrl={imageUrl}
        onPreview={onPreview}
        onEdit={onEdit}
        onDelete={onDelete}
        handleListeners={listeners}
      />
    </div>
  );
};

// 右侧图片管理：按 list 接口返回的对象数组渲染图片格子
/* eslint-disable react/prop-types */
const ModuleUploadManager = ({ moduleName }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [fileDesc, setFileDesc] = useState(EMPTY_LANG);
  const [fileSubDesc, setFileSubDesc] = useState(EMPTY_LANG);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const sensors = useSensors(
    // distance 约束：小于 5px 的位移视为点击，不影响点按预览/操作
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleQuery()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取文件列表失败');
      }
      const listData = data.data ?? [];
      setItems(Array.isArray(listData) ? listData : []);
    } catch (err) {
      message.error(`获取文件列表失败: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [moduleName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetModalForm = () => {
    setFileList([]);
    setFileDesc(EMPTY_LANG);
    setFileSubDesc(EMPTY_LANG);
    setEditingItem(null);
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
    setEditingItem(item);
    setFileDesc(normalizeLang(item.fileDesc));
    setFileSubDesc(normalizeLang(item.fileSubDesc));
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleItemDelete()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, fileId: item.fileId }),
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

  // 新增：先上传文件到模块目录，成功后登记条目到 info.json
  const handleAdd = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      message.error('请选择要上传的图片');
      return;
    }
    const desc = { zh: fileDesc.zh.trim(), en: fileDesc.en.trim(), ar: fileDesc.ar.trim() };
    if (!desc.zh) {
      message.error('请输入图片描述（中文）');
      return;
    }

    setSubmitting(true);
    try {
      // 1. 上传文件：multipart（moduleName + file）
      const formData = new FormData();
      formData.append('moduleName', moduleName);
      formData.append('file', file);
      const uploadRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.upload()}`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success || uploadData.code !== 1) {
        throw new Error(uploadData.message || '文件上传失败');
      }

      // 2. 新增条目：fileUrl / fileName / fileDesc 必填，fileSubDesc 可选
      // upload 返回 { filename: 磁盘uuid文件名, originalname: 原始显示名 }
      const { filename, originalname } = uploadData.data || {};
      if (!filename || !originalname) {
        throw new Error('上传接口返回数据异常');
      }
      // fileUrl 纯存路径（无域名、无 /icons 前缀），展示时由前端拼接
      const addRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleAdd()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName,
          fileUrl: `/${moduleName}/${filename}`,
          fileName: originalname,
          fileDesc: desc,
          fileSubDesc: {
            zh: fileSubDesc.zh.trim(),
            en: fileSubDesc.en.trim(),
            ar: fileSubDesc.ar.trim(),
          },
        }),
      });
      const addData = await addRes.json();
      if (!addRes.ok || !addData.success || addData.code !== 1) {
        throw new Error(addData.message || '条目登记失败');
      }

      message.success('上传成功');
      closeModal();
      fetchItems();
    } catch (err) {
      message.error(`上传失败: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 编辑：图片不可替换，仅更新描述 / 附属描述（多语言对象）
  const handleEdit = async () => {
    const desc = { zh: fileDesc.zh.trim(), en: fileDesc.en.trim(), ar: fileDesc.ar.trim() };
    if (!desc.zh) {
      message.error('请输入图片描述（中文）');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleEdit()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName,
          fileId: editingItem.fileId,
          fileDesc: desc,
          fileSubDesc: {
            zh: fileSubDesc.zh.trim(),
            en: fileSubDesc.en.trim(),
            ar: fileSubDesc.ar.trim(),
          },
        }),
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

  // 拖拽松开后调用 /sortItems，按 fileIds 顺序重排并重算 sort
  const persistSort = async (next) => {
    const prevItems = items;
    setItems(next);
    setSorting(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleItemSort()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName,
          fileIds: next.map((item) => item.fileId),
        }),
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

  const getItemKey = (item) => item.fileId || item.fileUrl || item.fileName;

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

  const uploadButton = (
    <div>
      {submitting ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>选择图片</div>
    </div>
  );

  // fileUrl 纯存路径（如 /header/xxx.png），展示时拼接 API_BASE_URL + /icons 前缀
  const getImageUrl = (item) => {
    if (item.fileUrl) {
      return item.fileUrl.startsWith('http')
        ? item.fileUrl
        : `${API_BASE_URL}/icons${item.fileUrl.startsWith('/') ? '' : '/'}${item.fileUrl}`;
    }
    if (item.fileName) return `${API_BASE_URL}/icons/${moduleName}/${item.fileName}`;
    return '';
  };

  return (
    <div className="module-upload-manager">
      <Spin spinning={loading || sorting}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)}
        >
          <div className="image-card-grid">
            <SortableContext items={items.map(getItemKey)} strategy={rectSortingStrategy}>
              {items.map((item) => (
                <SortableImageCard
                  key={getItemKey(item)}
                  item={item}
                  imageUrl={getImageUrl(item)}
                  onPreview={(target) => {
                    setPreviewUrl(getImageUrl(target));
                    setPreviewOpen(true);
                  }}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
            <div className="image-card image-card-add" onClick={openAddModal}>
              <PlusOutlined className="image-card-add-icon" />
              <span className="image-card-add-text">上传图片</span>
            </div>
          </div>
          <DragOverlay>
            {activeDragItem ? (
              <div className="image-card image-card-overlay">
                <CardContent
                  item={activeDragItem}
                  imageUrl={getImageUrl(activeDragItem)}
                  onPreview={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Spin>

      {/* 图片放大预览 */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width="auto"
        styles={{ body: { padding: 0, background: 'transparent' } }}
        style={{ top: 20 }}
        closable={false}
        maskClosable
      >
        <img
          src={previewUrl}
          alt="preview"
          style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: 8 }}
        />
      </Modal>

      <Modal
        title={modalMode === 'edit' ? '编辑图片' : '上传图片'}
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
        <div className="image-manage-modal">
          <Form layout="vertical">
          <Form.Item label="图片" required>
            {modalMode === 'edit' ? (
              <div className="edit-image-preview">
                <img src={getImageUrl(editingItem || {})} alt={editingItem?.fileName || ''} />
              </div>
            ) : (
              <Upload
                className="image-upload-select"
                listType="picture-card"
                accept="image/*"
                maxCount={1}
                fileList={fileList}
                beforeUpload={() => false}
                onChange={({ fileList: list }) => setFileList(list.slice(-1))}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            )}
          </Form.Item>
          <Form.Item label="图片描述" required>
            <div className="lang-input-group">
              <Input
                prefix={<span className="lang-tag">中文</span>}
                placeholder="请输入中文描述"
                value={fileDesc.zh}
                onChange={(e) => setFileDesc((prev) => ({ ...prev, zh: e.target.value }))}
                allowClear
              />
              <Input
                prefix={<span className="lang-tag">英文</span>}
                placeholder="请输入英文描述"
                value={fileDesc.en}
                onChange={(e) => setFileDesc((prev) => ({ ...prev, en: e.target.value }))}
                allowClear
              />
              <Input
                prefix={<span className="lang-tag">阿语</span>}
                placeholder="请输入阿语描述"
                value={fileDesc.ar}
                onChange={(e) => setFileDesc((prev) => ({ ...prev, ar: e.target.value }))}
                allowClear
              />
            </div>
          </Form.Item>
          <Form.Item label="附属描述">
            <div className="lang-input-group">
              <Input
                prefix={<span className="lang-tag">中文</span>}
                placeholder="请输入中文附属描述（选填）"
                value={fileSubDesc.zh}
                onChange={(e) => setFileSubDesc((prev) => ({ ...prev, zh: e.target.value }))}
                allowClear
              />
              <Input
                prefix={<span className="lang-tag">英文</span>}
                placeholder="请输入英文附属描述（选填）"
                value={fileSubDesc.en}
                onChange={(e) => setFileSubDesc((prev) => ({ ...prev, en: e.target.value }))}
                allowClear
              />
              <Input
                prefix={<span className="lang-tag">阿语</span>}
                placeholder="请输入阿语附属描述（选填）"
                value={fileSubDesc.ar}
                onChange={(e) => setFileSubDesc((prev) => ({ ...prev, ar: e.target.value }))}
                allowClear
              />
            </div>
          </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

// 左侧导航项：模块名 + 删除
/* eslint-disable react/prop-types */
const ModuleItem = ({ name, active, onSelect, onDelete }) => {
  return (
    <div
      className={`module-item${active ? ' active' : ''}`}
      onClick={onSelect}
    >
      <span className="module-item-name" title={name}>{name}</span>
      <Popconfirm
        title="确认删除模块"
        description={`确定要删除模块「${name}」吗？该模块下所有维护的图片数据都会被删除！`}
        onConfirm={onDelete}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <DeleteOutlined
          className="module-item-delete"
          onClick={(e) => e.stopPropagation()}
        />
      </Popconfirm>
    </div>
  );
};

// 文件管理：模块列表取自码表 moudle，左侧导航支持新增/删除/拖拽排序，右侧管理各模块图片
const FileManager = () => {
  const [modules, setModules] = useState([]);
  const [activeKey, setActiveKey] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addValue, setAddValue] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleList()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

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
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleCreate()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: name }),
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
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.moduleDelete()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: name }),
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
              <ModuleUploadManager moduleName={currentModule} />
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
