import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ImageUploader = ({ images, newImages, onImageUpload, onRemoveImage }) => {
  const handleImageUpload = (event) => {
    onImageUpload(event);
  };

  const renderImage = (image, index, isNewImage) => {
    let src;
    if (typeof image === 'string') {
      // Si la imagen es una URL (imagen existente)
      src = image;
    } else if (image instanceof File) {
      // Si la imagen es un objeto File (nueva imagen)
      src = URL.createObjectURL(image);
    } else {
      // Si no es ni string ni File, no renderizamos la imagen
      console.error('Invalid image type:', image);
      return null;
    }

    return (
      <Box key={index} sx={{ position: 'relative', display: 'inline-block', m: 1 }}>
        <img src={src} alt={`Uploaded ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
        <IconButton
          sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'background.paper' }}
          onClick={() => onRemoveImage(index, isNewImage)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={handleImageUpload}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" sx={{ mt: 2 }}>
          Upload Images
        </Button>
      </label>
      <Box sx={{ mt: 2 }}>
        {images.map((image, index) => renderImage(image, index, false))}
        {newImages.map((image, index) => renderImage(image, images.length + index, true))}
      </Box>
    </Box>
  );
};

export default ImageUploader;