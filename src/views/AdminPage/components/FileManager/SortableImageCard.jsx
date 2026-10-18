import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardContent from './CardContent';

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

export default SortableImageCard;
