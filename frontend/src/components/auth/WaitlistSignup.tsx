import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Person,
  CheckCircle
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';


// Styled Components
const WaitlistContainer = styled(Box)(() => ({
  background: '#fff',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
}));

const WaitlistCard = styled(Card)(() => ({
  position: 'relative',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#fff',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
}));



const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    
    '&.Mui-focused': {
      '& fieldset': {
        borderColor: '#000',
        borderWidth: '2px',
      }
    }
  }
}));

const ActionButton = styled(Button)(() => ({
  borderRadius: '4px',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: '#000',
  color: 'white',
  border: 'none',
  
  '&:hover': {
    background: '#333',
  },
}));

const SuccessDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    background: 'white',
  }
}));

interface WaitlistSignupProps {
  onSignInClick: () => void;
  onSuccess?: () => void;
}

const WaitlistSignup: React.FC<WaitlistSignupProps> = ({ onSignInClick, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          source: 'app_signup',
          metadata: {
            signup_method: 'waitlist_component',
            referrer: window.location.href
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setSuccessDialogOpen(true);
      setEmail('');
      setName('');
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <WaitlistContainer>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>

        <WaitlistCard elevation={0}>
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Typography variant="h3" fontWeight={700} sx={{ 
                mb: 2,
                color: '#000',
                fontSize: '2rem'
              }}>
                Join the Clip waitlist
              </Typography>
              
              <Typography variant="body1" sx={{ 
                mb: 3, 
                color: '#666',
                fontWeight: 400,
                fontSize: '1.1rem'
              }}>
                Daily spending insights that actually work
              </Typography>
            </Box>

            {/* Simple Features */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2, color: '#666', fontWeight: 400 }}>
                Get early access to daily spending insights and simple financial progress tools.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Waitlist Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <StyledTextField
                  fullWidth
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#000' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <ActionButton
                fullWidth
                type="submit"
                disabled={loading || !email || !name}
                sx={{ mb: 3 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Joining...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </ActionButton>
            </form>

            {/* Sign In Link */}
            <Box textAlign="center" sx={{ pt: 2, borderTop: '1px solid #e5e7eb' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Button
                variant="text"
                onClick={onSignInClick}
                sx={{
                  color: '#000',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: '#f5f5f5',
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </WaitlistCard>
      </Container>

      {/* Success Dialog */}
      <SuccessDialog 
        open={successDialogOpen} 
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircle sx={{ fontSize: '3rem', color: '#10b981', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: '#000' }}>
            You're on the list! 
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Thanks for joining the Clip waitlist.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We'll email you when we're ready to launch. Simple daily spending insights are coming soon.
          </Typography>
          
          <Box sx={{ 
            background: '#f5f5f5', 
            borderRadius: '8px', 
            p: 2, 
            border: '1px solid #e5e5e5' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>
              We'll email you when Clip is ready to launch.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            onClick={() => setSuccessDialogOpen(false)}
            sx={{
              background: '#000',
              color: 'white',
              borderRadius: '4px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: '#333',
              }
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </SuccessDialog>
    </WaitlistContainer>
  );
};

export default WaitlistSignup;