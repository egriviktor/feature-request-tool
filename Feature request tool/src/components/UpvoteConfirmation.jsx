import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Typography, Box 
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const UpvoteConfirmation = ({ open, onConfirm, onCancel }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      PaperProps={{
        sx: { borderRadius: 4, p: 1, maxWidth: 400 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <WarningAmberIcon color="warning" />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>First Vote of the Month</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Just a quick heads-up! You have exactly **5 upvotes** to use this month. 
          Make them count!
        </Typography>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 152, 0, 0.08)', borderRadius: 2, border: '1px solid rgba(255, 152, 0, 0.2)' }}>
          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
            TIP: You can revoke a vote up to 5 times if you change your mind.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" sx={{ fontWeight: 700, px: 3 }}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpvoteConfirmation;
