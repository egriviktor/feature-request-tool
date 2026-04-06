import React, { useState, useEffect, useRef } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Box, 
  Typography, 
  Button,
  ToggleButton, 
  ToggleButtonGroup, 
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  TextField,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DownloadIcon from '@mui/icons-material/Download';
import theme from './theme';
import CreateRequest from './components/CreateRequest';
import RequestList from './components/RequestList';
import useFeatureRequests from './hooks/useFeatureRequests';
import useAuth from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureRequestProvider } from './contexts/FeatureRequestContext';
import RegisterDirect from './pages/RegisterDirect';
import LoginDirect from './pages/LoginDirect';
import RequestDetails from './pages/RequestDetails';
import AdminRegister from './pages/AdminRegister';
import AdminLogin from './pages/AdminLogin';
import UpvoteConfirmation from './components/UpvoteConfirmation';

const STATUS_FILTERS = ['All', 'New', 'Rejected', 'Accepted', 'In progress', 'Delivered'];

const FeedbackTool = () => {
  const { user } = useAuth();
  const { 
    requests, addRequest, upvoteRequest, revokeUpvote, 
    canUpvote, canRevoke, upvotesRemaining,
    upvotesThisMonth, hasUpvoted, hasSeenConfirm, 
    setHasSeenConfirm, deleteRequest 
  } = useFeatureRequests(user?.email);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingVoteId, setPendingVoteId] = useState(null);
  
  // Date Filtering State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Export State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
  const lastUrlRef = useRef(null);

  // Cleanup Blob URL on unmount
  useEffect(() => {
    return () => {
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current);
      }
    };
  }, []);

  const handleSetShortcut = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    // Format to YYYY-MM-DD for <input type="date">
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };
  
  const handleExportCSV = () => {
    console.log('Export triggered. Current requests:', requests.length);
    // Filter requests by date
    let filteredExport = requests;
    if (startDate || endDate) {
      filteredExport = requests.filter(req => {
        const reqDate = new Date(req.createdAt);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        // Set end to end of day for inclusive comparison
        end.setHours(23, 59, 59, 999);
        return reqDate >= start && reqDate <= end;
      });
    }

    console.log('Filtered requests for export:', filteredExport.length);

    if (filteredExport.length === 0) {
      alert("No feature requests found in this date range.");
      return;
    }

    // Determine the max number of comments to create headers
    const maxComments = Math.max(...filteredExport.map(r => r.comments?.length || 0), 0);
    console.log('Max comments found:', maxComments);
    
    // Create headers
    const headers = ['Title', 'Description', 'Upvotes', 'Status', 'Created At'];
    for (let i = 1; i <= maxComments; i++) {
      headers.push(`Comment ${i}`);
    }
    
    // Helper to escape CSV values
    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };
    
    // Generate rows
    const rows = filteredExport.map(req => {
      const rowData = [
        escape(req.title),
        escape(req.description),
        escape(req.upvotes),
        escape(req.status),
        escape(req.createdAt)
      ];
      
      // Add comments each in its own cell
      const comments = req.comments || [];
      comments.forEach(comment => {
        rowData.push(escape(comment.text));
      });
      
      // PAD THE ROW to match headers length exactly
      while (rowData.length < headers.length) {
        rowData.push('');
      }
      
      return rowData.join(',');
    });
    
    console.log('Generating CSV content with', rows.length, 'rows');
    const csvContent = [headers.join(','), ...rows].join('\r\n');
    
    // 1. Revoke previous URL if it exists to prevent memory leaks
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
    }

    // 2. Create the new Blob and URL
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 3. Track it for future cleanup
    lastUrlRef.current = url;
    setExportUrl(url);
    setSnackbarOpen(true);
    
    // 4. Trigger the download immediately
    const fileName = `requests_${new Date().getTime()}.csv`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // 5. Minimal cleanup: Just remove the invisible link element from the DOM
    // We NO LONGER revoke the URL here via setTimeout to ensure the browser has 
    // plenty of time to finish the download.
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 10000);
    
    console.log('Export process initiated with lazy cleanup.');
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterStatus(newFilter);
    }
  };

  const handleUpvoteClick = (id) => {
    if (hasUpvoted(id, user.email)) {
      revokeUpvote(id, user.email);
    } else {
      if (!hasSeenConfirm) {
        setPendingVoteId(id);
        setShowConfirm(true);
      } else {
        upvoteRequest(id, user.email);
      }
    }
  };

  const confirmFirstVote = () => {
    if (pendingVoteId) {
      upvoteRequest(pendingVoteId, user.email);
    }
    setHasSeenConfirm(true);
    setShowConfirm(false);
    setPendingVoteId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <UpvoteConfirmation 
        open={showConfirm} 
        onConfirm={confirmFirstVote} 
        onCancel={() => setShowConfirm(false)} 
      />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Submit your feature request
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Help us build the product you want.
        </Typography>
      </Box>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={10000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          Export started! Check your Downloads folder. 
          {exportUrl && (
            <Button 
              size="small" 
              href={exportUrl} 
              download={`requests_${Date.now()}.csv`}
              sx={{ ml: 2, color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}
            >
              Manually download here
            </Button>
          )}
        </Alert>
      </Snackbar>

      <CreateRequest 
        requests={requests} 
        addRequest={addRequest} 
        upvoteRequest={handleUpvoteClick}
        canUpvote={canUpvote}
        hasUpvoted={(id) => hasUpvoted(id, user.email)}
      />

      <Divider sx={{ my: 6 }} />
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Community Requests
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" color={canUpvote ? 'text.secondary' : 'error'}>
              {upvotesRemaining} upvotes left this month
            </Typography>
            
            {user?.role === 'admin' && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <TextField
                    type="date"
                    size="small"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<DownloadIcon />} 
                    onClick={handleExportCSV}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', height: 40 }}
                  >
                    Export
                  </Button>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
                  >
                    Clear dates
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1 }}>Shortcuts:</Typography>
                  {[7, 14, 30].map(days => (
                    <Chip 
                      key={days} 
                      label={`${days}d`} 
                      size="small" 
                      onClick={() => handleSetShortcut(days)}
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20, 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } 
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <RequestList 
        requests={requests} 
        upvoteRequest={handleUpvoteClick} 
        filterStatus={filterStatus} 
        onFilterStatusChange={setFilterStatus}
        canUpvote={canUpvote}
        hasUpvoted={(id) => hasUpvoted(id, user.email)}
        deleteRequest={deleteRequest}
      />
    </Container>
  );
};

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <Router>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
              ShareYourIdeas
            </Typography>
            
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  {user.role === 'admin' && (
                    <Chip 
                      label="Admin" 
                      size="small" 
                      color="secondary" 
                      icon={<AdminPanelSettingsIcon sx={{ fontSize: '14px !important' }} />} 
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                  )}
                </Box>
                <IconButton onClick={logout} color="inherit" size="small">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            
            {!user && (
              <IconButton color="inherit">
                <Brightness4Icon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Routes>
        <Route path="/" element={user ? <FeedbackTool /> : <Navigate to="/login" />} />
        <Route path="/register" element={!user ? <RegisterDirect /> : <Navigate to="/" />} />
        <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to="/" />} />
        <Route path="/admin/register" element={!user ? <AdminRegister /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <LoginDirect /> : <Navigate to="/" />} />
        <Route path="/feature/:id" element={user ? <RequestDetails /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <FeatureRequestProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </FeatureRequestProvider>
    </AuthProvider>
  );
}

export default App;
