import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent,
  Chip, Grid, IconButton, Tooltip, Button,
  FormControl, Select, MenuItem, InputLabel,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TableSortLabel, TablePagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useFeatureRequests from '../hooks/useFeatureRequests';
import DeleteConfirmation from './DeleteConfirmation';
import MergeConfirmation from './MergeConfirmation';
import Checkbox from '@mui/material/Checkbox';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CloseIcon from '@mui/icons-material/Close';

const STATUS_ICONS = {
  'New': <AccessTimeIcon color="info" fontSize="small" />,
  'Rejected': <CancelIcon color="error" fontSize="small" />,
  'Accepted': <CheckCircleIcon color="success" fontSize="small" />,
  'In progress': <PendingIcon color="warning" fontSize="small" />,
  'Delivered': <CheckCircleIcon color="primary" fontSize="small" />,
};

const STATUS_COLORS = {
  'New': 'info',
  'Rejected': 'error',
  'Accepted': 'success',
  'In progress': 'warning',
  'Delivered': 'primary',
};

const STATUS_WEIGHT = {
  'New': 100,
  'Accepted': 90,
  'In progress': 80,
  'Delivered': 70,
  'Rejected': 10,
};

const RequestList = ({ filterStatus, onFilterStatusChange, upvoteRequest }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requests, canUpvote, hasUpvoted, deleteRequest, mergeRequests } = useFeatureRequests();
  const [stableSortedIds, setStableSortedIds] = useState([]);
  const [sortBy, setSortBy] = useState('upvotes');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Deletion Dialog State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Administrative Merge Mode
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);

  useEffect(() => {
    const sorted = [...requests]
      .filter(req => filterStatus === 'All' || req.status === filterStatus)
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'recent':
            comparison = new Date(a.createdAt) - new Date(b.createdAt);
            break;
          case 'comments':
            comparison = (a.comments?.length || 0) - (b.comments?.length || 0);
            break;
          case 'status':
            comparison = (STATUS_WEIGHT[a.status] || 0) - (STATUS_WEIGHT[b.status] || 0);
            break;
          case 'alpha':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'upvotes':
          default:
            comparison = a.upvotes - b.upvotes;
            break;
        }

        // Stability: use createdAt as tie-breaker for non-recent sorts
        if (comparison === 0 && sortBy !== 'recent') {
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
        }
        
        // Apply order: desc is largest/newest first, asc is smallest/oldest first
        return sortOrder === 'asc' ? comparison : -comparison;
      })
      .map(r => r.id);
    
    setStableSortedIds(sorted);
  }, [filterStatus, requests, sortBy, sortOrder]);

  useEffect(() => {
    setPage(0);
  }, [filterStatus]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      // Sensible defaults for new fields: A-Z for alpha, Most for others
      setSortOrder(field === 'alpha' ? 'asc' : 'desc');
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Map the stable IDs back to the actual request objects (which have the latest upvote counts)
  const filteredRequests = stableSortedIds
    .map(id => requests.find(r => r.id === id))
    .filter(Boolean);

  const selectedRequests = filteredRequests.filter(r => selectedIds.includes(r.id));
  const canMerge = selectedIds.length >= 2;

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filterStatus === 'All' ? 'Latest Requests' : `${filterStatus} Requests`}
        </Typography>
        
        <FormControl size="small" variant="outlined" sx={{ minWidth: 160 }}>
          <InputLabel id="status-filter-label" sx={{ fontSize: '0.8rem' }}>Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) => onFilterStatusChange(e.target.value)}
            sx={{ 
              borderRadius: 2, 
              fontSize: '0.85rem',
              '& .MuiSelect-select': { py: 1 }
            }}
          >
            <MenuItem value="All">All Requests</MenuItem>
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="In progress">In Progress</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {user?.role === 'admin' && (
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: isMergeMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 255, 255, 0.02)',
          p: 2,
          borderRadius: 2,
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <MergeTypeIcon fontSize="small" />
            Administrative Tools
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isMergeMode ? (
              <>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="primary"
                  disabled={!canMerge}
                  onClick={() => setIsMergeDialogOpen(true)}
                  startIcon={<MergeTypeIcon />}
                  sx={{ borderRadius: 1.5 }}
                >
                  Merge Selected ({selectedIds.length})
                </Button>
                <Button 
                  size="small" 
                  color="inherit" 
                  onClick={() => {
                    setIsMergeMode(false);
                    setSelectedIds([]);
                  }}
                  startIcon={<CloseIcon />}
                  sx={{ borderRadius: 1.5 }}
                >
                  Cancel Mode
                </Button>
              </>
            ) : (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => setIsMergeMode(true)}
                startIcon={<MergeTypeIcon />}
                sx={{ borderRadius: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Enter Merge Mode
              </Button>
            )}
          </Box>
        </Box>
      )}

      {filteredRequests.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 5 }}>
          No feature requests found for this status.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <Table sx={{ minWidth: 650 }} aria-label="feature requests table">
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  {isMergeMode && (
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    </TableCell>
                  )}
                  <TableCell width="80" align="center" sx={{ p: 0 }}>
                    <TableSortLabel
                      active={sortBy === 'upvotes'}
                      direction={sortBy === 'upvotes' ? sortOrder : 'desc'}
                      onClick={() => handleSort('upvotes')}
                      sx={{ 
                        '& .MuiTableSortLabel-icon': { opacity: sortBy === 'upvotes' ? 1 : 0.3 },
                        fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, pl: 2.5
                      }}
                    >
                      Votes
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'alpha' || sortBy === 'recent'}
                      direction={sortBy === 'alpha' || sortBy === 'recent' ? sortOrder : 'desc'}
                      onClick={() => handleSort(sortBy === 'alpha' ? 'recent' : 'alpha')}
                      sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}
                    >
                      Feature
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="120">
                    <TableSortLabel
                      active={sortBy === 'status'}
                      direction={sortBy === 'status' ? sortOrder : 'desc'}
                      onClick={() => handleSort('status')}
                      sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="100" align="center">
                    <TableSortLabel
                      active={sortBy === 'comments'}
                      direction={sortBy === 'comments' ? sortOrder : 'desc'}
                      onClick={() => handleSort('comments')}
                      sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, pl: 2.5 }}
                    >
                      Activity
                    </TableSortLabel>
                  </TableCell>
                  {user?.role === 'admin' && <TableCell width="60" align="center" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.map((req) => {
                  const isUpvoted = hasUpvoted(req.id);
                  const canAction = isUpvoted || canUpvote;
                  const tooltipTitle = isUpvoted ? "Revoke Vote" : (canUpvote ? "Upvote" : "Month limit reached");
                  
                  return (
                    <TableRow
                      key={req.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                        '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }
                      }}
                      onClick={() => !isMergeMode && navigate(`/feature/${req.id}`)}
                    >
                      {isMergeMode && (
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox 
                            size="small"
                            checked={selectedIds.includes(req.id)}
                            onChange={() => handleSelect(req.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Tooltip title={tooltipTitle}>
                            <span>
                              <IconButton 
                                size="small"
                                color={isUpvoted ? "secondary" : "primary"} 
                                disabled={!canAction}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  upvoteRequest(req.id);
                                }}
                                sx={{ 
                                  mb: 0.5,
                                  backgroundColor: isUpvoted ? 'rgba(156, 39, 176, 0.1)' : 'rgba(33, 150, 243, 0.08)',
                                  '&:hover': { backgroundColor: isUpvoted ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.15)' }
                                }}
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: isUpvoted ? 'secondary.light' : 'text.primary' }}>
                            {req.upvotes}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ py: 2, minWidth: 0, maxWidth: 400 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          {req.title}
                        </Typography>
                        <Tooltip title={req.description} followCursor leaveDelay={200}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            opacity: 0.7,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                          }}>
                            {req.description}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          icon={STATUS_ICONS[req.status]} 
                          label={req.status} 
                          color={STATUS_COLORS[req.status]} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600, height: 24, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {req.comments?.length || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      {user?.role === 'admin' && (
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Tooltip title="Delete Feature">
                            <IconButton 
                              size="small" 
                              color="error" 
                              sx={{ 
                                opacity: 0.5, 
                                '&:hover': { opacity: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)' } 
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteId(req.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelDisplayedRows={({ from, to, count }) => {
              const pagesTotal = Math.ceil(count / rowsPerPage);
              return `Page ${page + 1} of ${pagesTotal || 1} (Showing ${from}-${to} of ${count} items)`;
            }}
            sx={{
              color: 'text.secondary',
              '& .MuiTablePagination-selectIcon': { color: 'text.secondary' },
              '& .MuiTablePagination-actions': { color: 'text.secondary' },
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              bgcolor: 'rgba(255, 255, 255, 0.01)'
            }}
          />
        </>
      )}
      <DeleteConfirmation 
        open={isDeleteDialogOpen}
        title="Delete Feature Request"
        description="Are you sure you want to delete this feature request? It will be permanently removed from the community board."
        onConfirm={() => {
          if (deleteId) {
            deleteRequest(deleteId);
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
          }
        }}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeleteId(null);
        }}
      />
      <MergeConfirmation
        open={isMergeDialogOpen}
        selectedRequests={selectedRequests}
        onCancel={() => setIsMergeDialogOpen(false)}
        onConfirm={(primaryId) => {
          const sourceIds = selectedIds.filter(id => id !== primaryId);
          mergeRequests(primaryId, sourceIds);
          setIsMergeDialogOpen(false);
          setIsMergeMode(false);
          setSelectedIds([]);
        }}
      />
    </Box>
  );
};

export default RequestList;
