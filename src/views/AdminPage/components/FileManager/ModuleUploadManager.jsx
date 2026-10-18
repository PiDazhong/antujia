import { useState, useEffect, useCallback } from 'react';
import { message, Spin, Popconfirm, Modal, Input, Upload, Form } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableImageCard from './SortableImageCard';
import CardContent from './CardContent';
import { EMPTY_LANG, normalizeLang } from './utils';
import { API_BASE_URL, API_ENDPOINTS, FILE_BASE_URL } from '../../../../config/uploadModules';
import { authFetch } from '../../../../utils/authFetch';

// 多语言输入组：中文 / 英文 / 阿语三行
/* eslint-disable react/prop-types */
const LangInputGroup = ({ value, onChange, placeholders }) => (
  <div className="lang-input-group">
    {['zh', 'en', 'ar'].map((lang, index) => (
      <Input
        key={lang}
        prefix={<span className="lang-tag">{['中文', '英文', '阿语'][index]}</span>}
        placeholder={placeholders[index]}
        value={value[lang]}
        onChange={(e) => onChange((prev) => ({ ...prev, [lang]: e.target.value }))}
        allowClear
      />
    ))}
  </div>
);

// 右侧图片管理：按 list 接口返回的对象数组渲染图片格子
/* eslint-disable react/prop-types */
const ModuleUploadManager = ({ moduleName, active }) => {
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
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleQuery()}`, {
        method: 'POST',
        body: { moduleName },
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

  // 首次挂载及所属 tab 每次变为可见时重新拉取，保证看到的是最新数据
  useEffect(() => {
    if (active) fetchItems();
  }, [active, fetchItems]);

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
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleItemDelete()}`, {
        method: 'POST',
        body: { moduleName, fileId: item.fileId },
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
      const uploadRes = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.upload()}`, {
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
      const addRes = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleAdd()}`, {
        method: 'POST',
        body: {
          moduleName,
          fileUrl: `/${moduleName}/${filename}`,
          fileName: originalname,
          fileDesc: desc,
          fileSubDesc: {
            zh: fileSubDesc.zh.trim(),
            en: fileSubDesc.en.trim(),
            ar: fileSubDesc.ar.trim(),
          },
        },
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
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleEdit()}`, {
        method: 'POST',
        body: {
          moduleName,
          fileId: editingItem.fileId,
          fileDesc: desc,
          fileSubDesc: {
            zh: fileSubDesc.zh.trim(),
            en: fileSubDesc.en.trim(),
            ar: fileSubDesc.ar.trim(),
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

  // 拖拽松开后调用 /sortItems，按 fileIds 顺序重排并重算 sort
  const persistSort = async (next) => {
    const prevItems = items;
    setItems(next);
    setSorting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}${API_ENDPOINTS.moduleItemSort()}`, {
        method: 'POST',
        body: {
          moduleName,
          fileIds: next.map((item) => item.fileId),
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

  // fileUrl 纯存路径（如 /header/xxx.png），展示时拼接 FILE_BASE_URL 前缀
  const getImageUrl = (item) => {
    if (item.fileUrl) {
      return item.fileUrl.startsWith('http')
        ? item.fileUrl
        : `${FILE_BASE_URL}${item.fileUrl.startsWith('/') ? '' : '/'}${item.fileUrl}`;
    }
    if (item.fileName) return `${FILE_BASE_URL}/${moduleName}/${item.fileName}`;
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
              <LangInputGroup
                value={fileDesc}
                onChange={setFileDesc}
                placeholders={['请输入中文描述', '请输入英文描述', '请输入阿语描述']}
              />
            </Form.Item>
            <Form.Item label="附属描述">
              <LangInputGroup
                value={fileSubDesc}
                onChange={setFileSubDesc}
                placeholders={[
                  '请输入中文附属描述（选填）',
                  '请输入英文附属描述（选填）',
                  '请输入阿语附属描述（选填）',
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ModuleUploadManager;
