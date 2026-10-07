import { Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

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

export default ModuleItem;
