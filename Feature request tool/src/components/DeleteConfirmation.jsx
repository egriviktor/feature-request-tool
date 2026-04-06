import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, Button, 
  Box, Typography 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const DeleteConfirmation = ({ open, title, description, onConfirm, onCancel }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          border: '1px solid rgba(244, 67, 54, 0.2)',
          backgroundImage: 'linear-gradient(rgba(244, 67, 54, 0.05), rgba(0, 0, 0, 0))'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <DeleteForeverIcon color="error" />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {description || "Are you sure you want to delete this? This action cannot be undone."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onCancel} variant="text" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error" 
          autoFocus
          sx={{ 
            borderRadius: 2, 
            fontWeight: 800,
            textTransform: 'none',
            px: 3,
            boxShadow: '0 4px 14px 0 rgba(244, 67, 54, 0.39)'
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmation;
