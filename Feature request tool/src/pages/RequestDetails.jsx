import React, { useState } from 'react';
import { 
  Box, Container, Typography, Paper, Chip, 
  Divider, TextField, Button, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, IconButton, Tooltip,
  Select, MenuItem, FormControl
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import useFeatureRequests from '../hooks/useFeatureRequests';
import useAuth from '../hooks/useAuth';
import UpvoteConfirmation from '../components/UpvoteConfirmation';
import DeleteConfirmation from '../components/DeleteConfirmation';

const STATUS_OPTIONS = ['New', 'Accepted', 'In progress', 'Delivered', 'Rejected'];

const STATUS_ICONS = {
  'New': <AccessTimeIcon color="info" />,
  'Rejected': <CancelIcon color="error" />,
  'Accepted': <CheckCircleIcon color="success" />,
  'In progress': <PendingIcon color="warning" />,
  'Delivered': <CheckCircleIcon color="primary" />,
};

const STATUS_COLORS = {
  'New': 'info',
  'Rejected': 'error',
  'Accepted': 'success',
  'In progress': 'warning',
  'Delivered': 'primary',
};

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    requests, upvoteRequest, revokeUpvote, addComment, 
    updateStatus, deleteRequest, deleteComment, 
    canUpvote, upvotesThisMonth, hasUpvoted,
    hasSeenConfirm, setHasSeenConfirm
  } = useFeatureRequests();
  const [commentText, setCommentText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Deletion Dialogs State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Request not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>Back to board</Button>
      </Container>
    );
  }

  const isUpvoted = hasUpvoted(request.id, user?.email);

  const handleUpvote = () => {
    if (isUpvoted) {
      revokeUpvote(request.id, user.email);
    } else {
      if (!hasSeenConfirm) {
        setShowConfirm(true);
      } else {
        upvoteRequest(request.id, user.email);
      }
    }
  };

  const confirmFirstVote = () => {
    upvoteRequest(request.id, user.email);
    setHasSeenConfirm(true);
    setShowConfirm(false);
  };

  const handleStatusChange = (e) => {
    updateStatus(request.id, e.target.value);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addComment(request.id, commentText, user.name, user.role === 'admin');
    setCommentText('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <UpvoteConfirmation 
        open={showConfirm} 
        onConfirm={confirmFirstVote} 
        onCancel={() => setShowConfirm(false)} 
      />
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Back to board
      </Button>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
            {(() => {
              const canAction = isUpvoted || canUpvote;
              const tooltipTitle = isUpvoted ? "Revoke Vote" : (canUpvote ? "Upvote" : "Month limit reached");
              
              return (
                <Tooltip title={tooltipTitle}>
                  <span>
                    <IconButton 
                      onClick={handleUpvote} 
                      color={isUpvoted ? "secondary" : "primary"} 
                      size="large"
                      disabled={!canAction}
                      sx={{ 
                        backgroundColor: isUpvoted ? 'rgba(156, 39, 176, 0.1)' : 'rgba(33, 150, 243, 0.08)',
                        mb: 1,
                        '&:hover': {
                          backgroundColor: isUpvoted ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.15)',
                        }
                      }}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })()}
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{request.upvotes}</Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0, mr: 2 }}>
                {request.title}
              </Typography>
              
              {user.role === 'admin' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={request.status}
                      onChange={handleStatusChange}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <MenuItem key={status} value={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {STATUS_ICONS[status]}
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Tooltip title="Delete this feature request">
                    <IconButton 
                      color="error"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      sx={{ 
                        ml: 1, 
                        backgroundColor: 'rgba(244, 67, 54, 0.05)',
                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.15)' } 
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Chip 
                  icon={STATUS_ICONS[request.status]} 
                  label={request.status} 
                  color={STATUS_COLORS[request.status]} 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6, mb: 3, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {request.description}
            </Typography>
            
            <Typography variant="caption" color="text.disabled">
              Proposed on {new Date(request.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Discussion</Typography>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
        <Box component="form" onSubmit={handleAddComment}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{user.name[0]}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="What do you think about this idea?"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={!commentText.trim()}
                >
                  Post Comment
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <List sx={{ width: '100%' }}>
          {(!request.comments || request.comments.length === 0) ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No comments yet. Be the first to start the discussion!
            </Typography>
          ) : (
            request.comments.map((comment, index) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main', fontSize: '0.9rem' }}>
                      {comment.author[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {comment.author}
                          </Typography>
                          {comment.isAdmin && (
                            <Chip 
                              label="Admin" 
                              size="small" 
                              color="secondary" 
                              icon={<AdminPanelSettingsIcon sx={{ fontSize: '12px !important' }} />} 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase',
                                pl: 0.5
                              }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {user.role === 'admin' && (
                            <IconButton 
                              size="small" 
                              color="error" 
                              sx={{ 
                                opacity: 0.5, 
                                '&:hover': { opacity: 1, backgroundColor: 'rgba(244, 67, 54, 0.08)' } 
                              }}
                              onClick={() => {
                                setCommentToDelete(comment.id);
                                setIsDeleteCommentDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="inherit" sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ mt: 1, lineHeight: 1.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}
                      >
                        {comment.text}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < request.comments.length - 1 && <Divider component="li" variant="inset" sx={{ opacity: 0.1 }} />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Feature Deletion Dialog */}
      <DeleteConfirmation 
        open={isDeleteDialogOpen}
        title="Delete Feature Request"
        description={`Are you sure you want to PERMANENTLY delete "${request.title}"? This action cannot be undone.`}
        onConfirm={() => {
          deleteRequest(request.id);
          setIsDeleteDialogOpen(false);
          navigate('/');
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* Comment Deletion Dialog */}
      <DeleteConfirmation 
        open={isDeleteCommentDialogOpen}
        title="Delete Comment"
        description="Are you sure you want to remove this comment from the discussion?"
        onConfirm={() => {
          if (commentToDelete) {
            deleteComment(request.id, commentToDelete);
            setIsDeleteCommentDialogOpen(false);
            setCommentToDelete(null);
          }
        }}
        onCancel={() => {
          setIsDeleteCommentDialogOpen(false);
          setCommentToDelete(null);
        }}
      />
    </Container>
  );
};

export default RequestDetails;
