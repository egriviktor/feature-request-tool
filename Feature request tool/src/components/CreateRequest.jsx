import React, { useState, useMemo } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, 
  List, ListItem, ListItemText, Divider, Alert, Tooltip
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const CreateRequest = ({ requests, addRequest, upvoteRequest, canUpvote, hasUpvoted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Simple similarity matching based on title
  const similarRequests = useMemo(() => {
    if (title.length < 3) return [];
    return requests.filter(req => 
      req.title.toLowerCase().includes(title.toLowerCase())
    ).slice(0, 3);
  }, [title, requests]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addRequest(title, description);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 4, elevation: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Submit a Feature Request
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="What's your idea?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Add dark mode"
          margin="normal"
          onFocus={() => setShowForm(true)}
          required
        />

        {similarRequests.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Are you thinking of one of these? Upvote them instead of creating a new one!
            </Alert>
            <Paper variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <List disablePadding>
                {similarRequests.map((req, index) => (
                  <React.Fragment key={req.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        (() => {
                          const isUpvoted = hasUpvoted(req.id);
                          const tooltipTitle = isUpvoted ? "Revoke Vote" : (canUpvote ? "" : "Month limit reached");
                          
                          return (
                            <Tooltip title={tooltipTitle}>
                              <span>
                                <Button 
                                  size="small" 
                                  startIcon={<ArrowUpwardIcon />} 
                                  onClick={() => upvoteRequest(req.id)}
                                  variant={isUpvoted ? "contained" : "outlined"}
                                  color={isUpvoted ? "secondary" : "primary"}
                                  disabled={!isUpvoted && !canUpvote}
                                >
                                  {isUpvoted ? "Upvoted" : "Upvote"} ({req.upvotes})
                                </Button>
                              </span>
                            </Tooltip>
                          );
                        })()
                      }
                    >
                      <ListItemText 
                        primary={req.title} 
                        secondary={req.status} 
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {showForm && (
          <>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Tell us more about it"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Submit Request
              </Button>
              <Button onClick={() => setShowForm(false)} variant="text">
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CreateRequest;
