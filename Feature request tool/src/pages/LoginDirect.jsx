import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, 
  Button, Paper, Alert, Link as MuiLink 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginDirect = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginDirect } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = loginDirect(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 15 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
          Login
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Enter your credentials to access your account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            size="large" 
            sx={{ mt: 3, py: 1.5 }}
          >
            Login
          </Button>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" sx={{ fontWeight: 600 }}>
                Register
              </MuiLink>
            </Typography>
          </Box>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <MuiLink component={Link} to="/admin/login" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
              Are you an admin? Log in here
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginDirect;
