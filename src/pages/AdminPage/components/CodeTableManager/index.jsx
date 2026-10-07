/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin } from 'antd';
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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import RowContent from './RowContent';
import SortableRow from './SortableRow';
import { CODE_TABLE_BASE, PROTECTED_CODES } from './constants';
import { authFetch } from '../../../../utils/authFetch';

// 信息管理：维护码表（codeTable）数据，支持行拖拽排序
const CodeTableManager = ({ active }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const sensors = useSensors(
    // distance 约束：小于 5px 的位移视为点击，不影响输入框操作
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${CODE_TABLE_BASE}/query`, {
        method: 'POST',
        body: { codes: [] },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '查询失败');
      }
      const arr = Array.isArray(data.data) ? data.data : [];
      arr.sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 0;
        const sb = typeof b.sort === 'number' ? b.sort : 0;
        return sa - sb;
      });
      setList(arr.map((item) => ({ ...item, key: item.code })));
    } catch (err) {
      message.error(`查询码表失败: ${err.message}`);
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
      { sort: '', code: '', value: '', desc: '', key: `draft-${Date.now()}`, isNew: true },
    ]);
  };

  const handleChange = (index, field, value) => {
    setList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // 删除：已保存的行调用 /delete（服务端会重算剩余 sort），未保存的草稿行直接移除
  const handleDelete = async (index) => {
    const item = list[index];
    // 兜底：系统内置 Code 不允许删除（正常入口已隐藏删除按钮）
    if (PROTECTED_CODES.includes(item.code)) return;
    if (!item.isNew && item.code && item.code.trim()) {
      try {
        const res = await authFetch(`${CODE_TABLE_BASE}/delete`, {
          method: 'POST',
          body: { code: item.code.trim() },
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

  // 保存：批量调用 /save，不传 sort 时服务端保留已有条目的 sort、新条目排到末尾
  const handleSave = async () => {
    const emptyCode = list.some((item) => !item.code || !item.code.trim());
    if (emptyCode) {
      message.error('Code 不能为空');
      return;
    }
    const codes = list.map((item) => item.code.trim());
    if (new Set(codes).size !== codes.length) {
      message.error('Code 不能重复');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(`${CODE_TABLE_BASE}/save`, {
        method: 'POST',
        body: {
          items: list.map((item) => ({
            code: item.code.trim(),
            value: item.value ?? null,
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

  // 拖拽松开后调用 /sort，按 codes 顺序重排并重算 sort 为 1..n
  const persistSort = async (next) => {
    const codes = next.filter((item) => !item.isNew).map((item) => item.code.trim());
    const prevList = list;
    setList(next);
    setSorting(true);
    try {
      const res = await authFetch(`${CODE_TABLE_BASE}/sort`, {
        method: 'POST',
        body: { codes },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '排序失败');
      }
      message.success('排序已保存');
    } catch (err) {
      setList(prevList);
      message.error(`排序失败: ${err.message}`);
    } finally {
      setSorting(false);
    }
  };

  const handleDragStart = (event) => {
    const item = list.find((entry) => entry.key === event.active.id);
    setActiveDragItem(item || null);
  };

  const handleDragEnd = (event) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.findIndex((item) => item.key === active.id);
    const newIndex = list.findIndex((item) => item.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    persistSort(arrayMove(list, oldIndex, newIndex));
  };

  return (
    <div className="manager-panel code-table-panel">
      <div className="code-table-toolbar">
        <div className="toolbar-title">
          <p>拖拽左侧手柄可排序，保存后生效</p>
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
      <Spin spinning={loading || sorting}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)}
        >
          <div className="code-table-manager">
            <div className="code-table-header">
              <span className="code-table-col drag-col"></span>
              <span className="code-table-col sort-col">序号</span>
              <span className="code-table-col code-col">Code（必填）</span>
              <span className="code-table-col value-col">Value</span>
              <span className="code-table-col desc-col">Desc</span>
              <span className="code-table-col action-col">操作</span>
            </div>
            <div className="code-table-body">
              <SortableContext items={list.map((item) => item.key)} strategy={verticalListSortingStrategy}>
                {list.map((item, index) => (
                  <SortableRow
                    key={item.key}
                    item={item}
                    index={index}
                    onChange={handleChange}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
              {list.length === 0 && (
                <div className="code-table-empty">暂无数据，请点击右上角「新增」创建</div>
              )}
            </div>
          </div>
        </DndContext>
      </Spin>
      <DragOverlay>
        {activeDragItem ? (
          <div className="code-table-row overlay-row">
            <RowContent
              item={activeDragItem}
              index={list.findIndex((item) => item.key === activeDragItem.key)}
              onChange={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </div>
  );
};

export default CodeTableManager;
