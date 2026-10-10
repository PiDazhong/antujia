import { Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { getLangText } from './utils';
import Abbr from '../../../../components/Abbr';

// 图片卡片内容（拖拽悬浮层也复用这份渲染）
/* eslint-disable react/prop-types */
const CardContent = ({ item, imageUrl, onPreview, onEdit, onDelete, handleListeners }) => (
  <>
    <span className="image-card-handle" title="拖拽排序" {...handleListeners}>
      <HolderOutlined />
    </span>
    <div className="image-card-img" onClick={() => onPreview(item)}>
      <img
        src={imageUrl}
        alt={item.fileName || ''}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="image-card-actions" onClick={(e) => e.stopPropagation()}>
        <EditOutlined className="image-card-action-btn" onClick={() => onEdit(item)} />
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
      <Abbr className="image-card-desc" text={getLangText(item.fileDesc)} line={1} />
      <Abbr className="image-card-subdesc" text={getLangText(item.fileSubDesc)} line={1} />
    </div>
  </>
);

export default CardContent;
