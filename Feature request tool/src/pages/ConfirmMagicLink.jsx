import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import useAuth from '../hooks/useAuth';

const ConfirmMagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirm, user } = useAuth();
  const [status, setStatus] = useState('confirming');
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;
    
    const token = searchParams.get('token');
    if (token) {
      hasConfirmed.current = true;
      const success = confirm(token);
      if (success) {
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setStatus('error');
      }
    } else {
      setStatus('error');
    }
  }, [searchParams, confirm, navigate]);

  return (
    <Container maxWidth="xs" sx={{ mt: 20 }}>
      <Box sx={{ textAlign: 'center' }}>
        {status === 'confirming' && (
          <>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h5">Confirming your magic link...</Typography>
          </>
        )}
        {status === 'success' && (
          <Alert severity="success" sx={{ py: 3, px: 5, borderRadius: 4 }}>
            <Typography variant="h6">Successfully logged in!</Typography>
            <Typography variant="body2">Redirecting to the feedback tool...</Typography>
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ py: 3, px: 5, borderRadius: 4 }}>
            <Typography variant="h6">Invalid or expired magic link.</Typography>
            <Typography variant="body2">Please try registering again.</Typography>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ConfirmMagicLink;
