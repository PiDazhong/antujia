import { Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import Abbr from '../../../../components/Abbr';
import { getLangText } from '../FileManager/utils';

// 文本卡片内容（拖拽悬浮层也复用这份渲染）
// 服务端 /shark/query 对空文本返回 `${sharkKey}_${LANG}` 占位，此处直接展示返回的 sharkText
/* eslint-disable react/prop-types */
const SharkCardContent = ({ item, onEdit, onDelete, handleListeners }) => (
  <div className="shark-card-body">
    <div className="shark-card-head">
      <span className="shark-card-handle" title="拖拽排序" {...handleListeners}>
        <HolderOutlined />
      </span>
      <Abbr className="shark-card-key" text={item.sharkKey ?? ''} lines={1} />
      <div className="shark-card-actions" onClick={(e) => e.stopPropagation()}>
        <EditOutlined
          className="shark-card-action-btn"
          onClick={() => onEdit(item)}
        />
        <Popconfirm
          title="确认删除"
          description={`确定要删除文本条目「${item.sharkKey}」吗？`}
          onConfirm={() => onDelete(item)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <DeleteOutlined className="shark-card-action-btn danger" />
        </Popconfirm>
      </div>
    </div>
    <div className="shark-card-texts">
      <div className="shark-card-text">
        <i className="shark-card-lang">中</i>
        <Abbr text={getLangText(item.sharkText)} lines={2} />
      </div>
      <div className="shark-card-text">
        <i className="shark-card-lang">EN</i>
        <Abbr text={item.sharkText?.en ?? ''} lines={2} />
      </div>
      <div className="shark-card-text">
        <i className="shark-card-lang">AR</i>
        <Abbr text={item.sharkText?.ar ?? ''} lines={2} />
      </div>
    </div>
  </div>
);

export default SharkCardContent;
