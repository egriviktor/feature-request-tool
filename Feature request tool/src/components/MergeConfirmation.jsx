import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, FormControl, 
  RadioGroup, FormControlLabel, Radio, 
  Typography, Box, Alert, Divider
} from '@mui/material';
import MergeTypeIcon from '@mui/icons-material/MergeType';

const MergeConfirmation = ({ open, selectedRequests, onConfirm, onCancel }) => {
  const [primaryId, setPrimaryId] = useState('');

  const handleConfirm = () => {
    if (primaryId) {
      onConfirm(primaryId);
    }
  };

  const totalVotes = selectedRequests.reduce((sum, r) => sum + r.upvotes, 0);
  const totalComments = selectedRequests.reduce((sum, r) => sum + (r.comments?.length || 0), 0);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth PaperProps={{
      sx: { 
        borderRadius: 4, 
        backgroundColor: 'rgba(30, 30, 35, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
      }
    }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <MergeTypeIcon color="primary" />
        Merge Feature Requests
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2, backgroundColor: 'rgba(2, 136, 209, 0.1)', color: '#90caf9' }}>
          Select the <strong>Primary</strong> request. All other selected items will be deleted, and their upvotes and comments will be moved to the primary.
        </Alert>

        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
          Choose Primary Destination
        </Typography>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={primaryId}
            onChange={(e) => setPrimaryId(e.target.value)}
          >
            {selectedRequests.map((req) => (
              <Box key={req.id} sx={{ 
                mb: 1, 
                p: 1.5, 
                borderRadius: 2, 
                border: '1px solid',
                borderColor: primaryId === req.id ? 'primary.main' : 'rgba(255,255,255,0.05)',
                backgroundColor: primaryId === req.id ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                <FormControlLabel 
                  value={req.id} 
                  control={<Radio size="small" />} 
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.title}</Typography>
                      <Typography variant="caption" color="text.secondary">Current Votes: {req.upvotes}</Typography>
                    </Box>
                  } 
                  sx={{ width: '100%', ml: 0 }}
                />
              </Box>
            ))}
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>Resulting Consolidation</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="primary">{totalVotes}</Typography>
              <Typography variant="caption" color="text.secondary">Total Upvotes</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="secondary">{totalComments}</Typography>
              <Typography variant="caption" color="text.secondary">Total Comments</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onCancel} sx={{ borderRadius: 1.5, color: 'text.secondary' }}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!primaryId}
          startIcon={<MergeTypeIcon />}
          sx={{ borderRadius: 1.5, px: 3, boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)' }}
        >
          Consolidate & Merge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeConfirmation;
