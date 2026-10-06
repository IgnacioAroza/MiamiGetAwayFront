import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

const FormDialog = ({ 
  open, 
  onClose, 
  onSave,
  saveDisabled = false,
  saving = false,
  savingLabel = 'Saving…',
  children, 
  title = 'Edit' 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1e1e1e',
          color: '#fff'
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary" disabled={saveDisabled || saving}>
          {saving ? savingLabel : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog; 
