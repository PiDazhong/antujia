import { Button, Input } from 'antd';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { PROTECTED_CODES } from './constants';

// 行内容（拖拽悬浮层也复用这份渲染）
/* eslint-disable react/prop-types */
const RowContent = ({ item, index, onChange, onDelete, handleListeners }) => (
  <>
    <div className="code-table-col drag-col">
      <span
        className={`drag-handle${item.isNew ? ' disabled' : ''}`}
        title={item.isNew ? '保存后可拖拽排序' : '拖拽排序'}
        {...handleListeners}
      >
        <HolderOutlined />
      </span>
    </div>
    <div className="code-table-col sort-col">
      <span className="sort-text">{index + 1}</span>
    </div>
    <div className="code-table-col code-col">
      <Input
        variant="filled"
        placeholder="请输入 Code"
        value={item.code}
        disabled={!item.isNew}
        onChange={(e) => onChange(index, 'code', e.target.value)}
      />
    </div>
    <div className="code-table-col value-col">
      <Input
        variant="filled"
        placeholder="请输入 Value"
        value={item.value ?? ''}
        disabled={item.code === 'moudle'}
        onChange={(e) => onChange(index, 'value', e.target.value)}
      />
    </div>
    <div className="code-table-col desc-col">
      <Input
        variant="filled"
        placeholder="请输入 Desc"
        value={item.desc}
        onChange={(e) => onChange(index, 'desc', e.target.value)}
      />
    </div>
    <div className="code-table-col action-col">
      {!PROTECTED_CODES.includes(item.code) && (
        <Button
          type="link"
          danger
          onClick={() => onDelete(index)}
          icon={<DeleteOutlined />}
        >
          删除
        </Button>
      )}
    </div>
  </>
);

export default RowContent;
