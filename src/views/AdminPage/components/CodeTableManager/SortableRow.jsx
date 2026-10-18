import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RowContent from './RowContent';

// 可排序行：整行响应拖拽，其他行由 SortableContext 平滑让位
/* eslint-disable react/prop-types */
const SortableRow = ({ item, index, onChange, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled: item.isNew,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`code-table-row${item.isNew ? ' draft-row' : ''}${isDragging ? ' row-hidden' : ''}`}
      {...attributes}
    >
      <RowContent item={item} index={index} onChange={onChange} onDelete={onDelete} handleListeners={listeners} />
    </div>
  );
};

export default SortableRow;
