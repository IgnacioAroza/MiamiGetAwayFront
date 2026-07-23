import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DndContext,
  closestCenter,
  PointerSensor,
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

const buildItemId = (image, index, isNewImage) =>
  isNewImage ? `new-${image.name}-${image.size}-${image.lastModified}-${index}` : `existing-${image}`;

const SortableThumbnail = ({ id, src, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ position: 'relative', display: 'inline-block', m: 1, touchAction: 'none' }}>
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
      >
        <img src={src} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', display: 'block', borderRadius: 4 }} />
      </Box>
      <IconButton
        size="small"
        sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'background.paper' }}
        onClick={onRemove}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      <DragIndicatorIcon
        fontSize="small"
        sx={{ position: 'absolute', bottom: 2, left: 2, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '2px', pointerEvents: 'none' }}
      />
    </Box>
  );
};

const ImageUploader = ({ images, newImages, onImageUpload, onRemoveImage, onReorder }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const items = [
    ...images.map((image, index) => ({ id: buildItemId(image, index, false), src: image, isNewImage: false })),
    ...newImages.map((image, index) => ({ id: buildItemId(image, index, true), src: URL.createObjectURL(image), isNewImage: true, file: image })),
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!onReorder || !over || active.id === over.id) return;

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    // El orden final que arma el backend siempre pone las nuevas después de las
    // existentes, así que sólo tiene sentido reordenar dentro de cada grupo.
    if (items[oldIndex].isNewImage !== items[newIndex].isNewImage) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const reorderedImages = reordered.filter(item => !item.isNewImage).map(item => item.src);
    const reorderedNewImages = reordered.filter(item => item.isNewImage).map(item => item.file);
    onReorder(reorderedImages, reorderedNewImages);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={onImageUpload}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" sx={{ mt: 2 }}>
          Upload Images
        </Button>
      </label>
      {items.length > 0 && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Arrastrá las imágenes para cambiar el orden
        </Typography>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap' }}>
            {items.map((item, index) => (
              <SortableThumbnail
                key={item.id}
                id={item.id}
                src={item.src}
                onRemove={() => onRemoveImage(index, item.isNewImage)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default ImageUploader;
