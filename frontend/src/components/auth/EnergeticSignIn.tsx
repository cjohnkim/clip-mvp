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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await onLogin(email, password);
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
              
              <Typography variant="body1" sx={{ 
                mb: 3, 
                color: '#666',
                fontWeight: 400
              }}>
                Access your financial training dashboard
              </Typography>
              
              <Typography variant="body2" sx={{ 
                mb: 3, 
                color: '#00d4aa',
                fontWeight: 500,
                fontStyle: 'italic'
              }}>
                Demo: cjohnkim@gmail.com / SimpleClip123
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
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
                {loading ? 'Starting Your Training...' : 'Begin Financial Training 🚀'}
              </ActionButton>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
            </Divider>

            {/* Waitlist Signup */}
            <Box textAlign="center">
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                Join the waitlist to become a Financial Athlete
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={onWaitlistSignup}
                sx={{
                  borderRadius: '4px',
                  padding: '12px 24px',
                  borderColor: '#00d4aa',
                  color: '#00d4aa',
                  fontWeight: 600,
                  textTransform: 'none',
                  
                  '&:hover': {
                    borderColor: '#00b894',
                    color: '#00b894',
                    background: '#f0fffe',
                  }
                }}
              >
                🏃‍♂️ Join the Waitlist
              </Button>
              
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                Ready to transform your financial habits into athletic performance?
              </Typography>
            </Box>
          </CardContent>
        </SignInCard>
      </Container>
    </HeroContainer>
  );
};

export default EnergeticSignIn;