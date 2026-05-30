import React, { useState, useEffect } from 'react';
import {
    Box, Dialog, DialogContent, IconButton, Typography,
} from '@mui/material';
import {
    Close as CloseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const ReceiptLightbox = ({ open, onClose, images = [], initialIndex = 0 }) => {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) setIndex(initialIndex);
    }, [open, initialIndex]);

    if (!images.length) return null;

    const hasPrev = index > 0;
    const hasNext = index < images.length - 1;

    const handlePrev = (e) => { e.stopPropagation(); setIndex(i => i - 1); };
    const handleNext = (e) => { e.stopPropagation(); setIndex(i => i + 1); };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' && hasPrev) setIndex(i => i - 1);
        if (e.key === 'ArrowRight' && hasNext) setIndex(i => i + 1);
        if (e.key === 'Escape') onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            onKeyDown={handleKeyDown}
            PaperProps={{
                sx: {
                    bgcolor: '#0d0d0d',
                    backgroundImage: 'none',
                    overflow: 'hidden',
                    position: 'relative',
                },
            }}
        >
            {/* Close */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute', top: 8, right: 8, zIndex: 10,
                    color: '#fff', bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Counter */}
            {images.length > 1 && (
                <Typography
                    sx={{
                        position: 'absolute', top: 12, left: '50%',
                        transform: 'translateX(-50%)', zIndex: 10,
                        color: '#ccc', fontSize: '0.8rem',
                        bgcolor: 'rgba(0,0,0,0.5)', px: 1.5, py: 0.3, borderRadius: 2,
                    }}
                >
                    {index + 1} / {images.length}
                </Typography>
            )}

            <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                {/* Prev arrow */}
                {hasPrev && (
                    <IconButton
                        onClick={handlePrev}
                        sx={{
                            position: 'absolute', left: 8, zIndex: 10,
                            color: '#fff', bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}

                <Box
                    component="img"
                    src={images[index]}
                    alt={`Receipt ${index + 1}`}
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        display: 'block',
                        mx: 'auto',
                    }}
                />

                {/* Next arrow */}
                {hasNext && (
                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'absolute', right: 8, zIndex: 10,
                            color: '#fff', bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReceiptLightbox;
