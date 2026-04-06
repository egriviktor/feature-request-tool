import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, 
  Button, Paper, Alert, Link as MuiLink,
  InputAdornment, IconButton, Fade
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a bit of "authentication" delay for premium feel
    setTimeout(() => {
      const result = loginAdmin(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <Container maxWidth="xs" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FFD700 0%, #9C27B0 100%)',
            }
          }}
        >
          <Box sx={{ mb: 3 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '16px', 
                backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                border: '1px solid rgba(156, 39, 176, 0.3)'
              }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 36, color: '#9C27B0' }} />
              </Box>
            </motion.div>
            
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
              Admin portal to manage your customers' ideas
            </Typography>
          </Box>

          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                variant="outlined"
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(211, 47, 47, 0.05)',
                  color: '#ff5252',
                  borderColor: 'rgba(211, 47, 47, 0.2)'
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }
              }}
            />
            
            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                mt: 4, 
                py: 1.8, 
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(90deg, #9C27B0 0%, #673AB7 100%)',
                boxShadow: '0 8px 16px -4px rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ab47bc 0%, #7e57c2 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 20px -4px rgba(156, 39, 176, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>

            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                Need administrative access?{' '}
                <MuiLink 
                  component={Link} 
                  to="/admin/register" 
                  sx={{ 
                    color: '#9C27B0', 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Register Here
                </MuiLink>
              </Typography>
              
              <Box sx={{ 
                pt: 2, 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <MuiLink 
                  component={Link} 
                  to="/login" 
                  sx={{ 
                    color: 'text.disabled', 
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  Return to Community Portal
                </MuiLink>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AdminLogin;
