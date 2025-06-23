import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';


// Styled Components
const HeroContainer = styled(Box)(() => ({
  background: '#f8fafc',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
}));

const SignInCard = styled(Card)(() => ({
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
  background: 'white',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    
    '&.Mui-focused': {
      '& fieldset': {
        borderColor: '#00d4aa',
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
  background: '#00d4aa',
  color: 'white',
  border: 'none',
  
  '&:hover': {
    background: '#00b894',
  },
  
  '&:disabled': {
    background: '#cccccc',
    color: 'white',
  },
}));

interface EnergeticSignInProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onWaitlistSignup: () => void;
  loading?: boolean;
  error?: string;
}

const EnergeticSignIn: React.FC<EnergeticSignInProps> = ({
  onLogin,
  onWaitlistSignup,
  loading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Add global error handler to catch pattern validation errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      if (event.message && event.message.includes('THE STRING DID NOT MATCH THE EXPECTED PATTERN')) {
        console.error('Pattern validation error detected!', event);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EnergeticSignIn handleSubmit called', { email, password: password ? '***' : 'empty' });
    
    if (email && password) {
      try {
        console.log('Calling onLogin...');
        await onLogin(email, password);
        console.log('onLogin completed successfully');
      } catch (error) {
        console.error('EnergeticSignIn onLogin error:', error);
        throw error;
      }
    } else {
      console.error('Email or password is empty', { email: !!email, password: !!password });
    }
  };


  return (
    <HeroContainer>
      <Container maxWidth="sm">

        <SignInCard elevation={0}>
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Typography variant="h3" fontWeight={700} sx={{ 
                mb: 2,
                color: '#00d4aa',
                fontSize: '2rem'
              }}>
                Sign In to Clip
              </Typography>
              
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 3 }}>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    console.log('Email field changed:', e.target.value);
                    setEmail(e.target.value);
                  }}
                  onBlur={(e) => {
                    console.log('Email field blurred:', e.target.value);
                  }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#00d4aa' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#00d4aa' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <ActionButton
                fullWidth
                type="submit"
                disabled={loading || !email || !password}
                sx={{ mb: 3 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </ActionButton>
              
              <Box textAlign="center" sx={{ mb: 3 }}>
                <Button variant="text" size="small" sx={{ color: '#00d4aa' }}>
                  Forgot password?
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Need an account?
              </Typography>
              
              <Button
                variant="text"
                onClick={onWaitlistSignup}
                sx={{
                  color: '#00d4aa',
                  textTransform: 'none',
                }}
              >
                Sign up
              </Button>
            </Box>
          </CardContent>
        </SignInCard>
      </Container>
    </HeroContainer>
  );
};

export default EnergeticSignIn;