import React from 'react';
import { Grid, TextField } from '@mui/material';

const NotesSection = ({ formData, onChange }) => {
    return (
        <>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={onChange}
                    multiline
                    rows={3}
                    placeholder="Add any relevant notes about the reservation..."
                />
            </Grid>
        </>
    );
};

export default NotesSection;
