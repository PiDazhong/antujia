import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SharkCardContent from './SharkCardContent';

// 可排序文本卡片：整卡响应拖拽，其他卡片由 SortableContext 平滑让位
/* eslint-disable react/prop-types */
const SortableSharkCard = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.sharkKey,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`shark-card${isDragging ? ' row-hidden' : ''}`}
      {...attributes}
    >
      <SharkCardContent
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        handleListeners={listeners}
      />
    </div>
  );
};

export default SortableSharkCard;
