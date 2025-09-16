import React from 'react';
import { Grid, TextField } from '@mui/material';

const NotesSection = ({ formData, onChange }) => {
    // Prevenir submit al presionar Enter (solo en este caso permitir nueva línea con Shift+Enter)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // En textarea, Enter normalmente crea nueva línea, pero Ctrl/Cmd+Enter podría enviar
            // Por ahora solo prevenimos si no hay Shift (permitiendo Shift+Enter para nueva línea)
            return; // Permitir Enter para nueva línea en textarea
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    multiline
                    rows={3}
                    placeholder="Add any relevant notes about the reservation..."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#4A4747',
                            borderRadius: 1,
                            '& fieldset': { borderColor: '#717171' },
                            '&:hover fieldset': { borderColor: '#717171' },
                            '&.Mui-focused fieldset': { borderColor: '#717171' },
                        },
                        '& .MuiInputLabel-root': { 
                            color: '#888',
                            '&.Mui-focused': { color: '#888' }
                        },
                        '& .MuiOutlinedInput-input': { 
                            color: '#fff',
                            padding: '12px 16px'
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#aaa',
                            opacity: 1
                        }
                    }}
                />
            </Grid>
        </Grid>
    );
};

export default NotesSection;
