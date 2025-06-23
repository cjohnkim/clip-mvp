import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  SportsMma,
  CheckCircle,
  Cancel,
  AccessTime,
  EmojiEvents,
  Person
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { athleticColors } from '../../theme/athleticTheme';

// Animations
const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const progressGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
`;

// Styled Components
const SignupContainer = styled(Box)(() => ({
  background: `linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%)`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
    zIndex: 1,
  }
}));

const SignupCard = styled(Card)(() => ({
  position: 'relative',
  zIndex: 2,
  borderRadius: '24px',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
    },
    
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
      
      '& fieldset': {
        borderColor: athleticColors.primary,
        borderWidth: '2px',
      }
    }
  }
}));

const ActionButton = styled(Button)(() => ({
  borderRadius: '12px',
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
  color: 'white',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  '&:hover': {
    background: `linear-gradient(135deg, ${athleticColors.victory} 0%, ${athleticColors.primary} 100%)`,
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
  },
  
  '&:active': {
    transform: 'translateY(-1px)',
  }
}));

const RequirementItem = styled(ListItem)<{ met: boolean }>(({ met }) => ({
  padding: '4px 0',
  '& .MuiListItemIcon-root': {
    minWidth: '32px',
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    color: met ? athleticColors.victory : '#6b7280',
    fontWeight: met ? 600 : 400,
  }
}));

const PasswordStrengthBar = styled(LinearProgress)<{ strength: number }>(({ strength }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#f3f4f6',
  marginTop: 8,
  animation: strength > 0 ? `${progressGlow} 2s ease-in-out infinite` : 'none',
  
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: strength < 40 ? '#ef4444' 
                    : strength < 70 ? '#f59e0b'
                    : strength < 90 ? '#10b981'
                    : athleticColors.gold,
  }
}));

interface TokenData {
  email: string;
  name: string;
  expires_at: string;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

const TokenSignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No signup token provided');
      setValidatingToken(false);
    }
  }, [token]);

  useEffect(() => {
    if (password) {
      validatePasswordRequirements();
    }
  }, [password]);

  const validateToken = async () => {
    try {
      setValidatingToken(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/waitlist/validate-token/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid token');
      }

      if (data.valid) {
        setTokenData(data);
      } else {
        setError(data.error || 'Token is not valid');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate token');
    } finally {
      setValidatingToken(false);
    }
  };

  const validatePasswordRequirements = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/waitlist/validate-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.requirements) {
        setPasswordRequirements(data.requirements);
      }
    } catch (err) {
      console.error('Password validation error:', err);
    }
  };

  const getPasswordStrength = (): number => {
    const requirements = Object.values(passwordRequirements);
    const metCount = requirements.filter(Boolean).length;
    return (metCount / requirements.length) * 100;
  };

  const getPasswordStrengthLabel = (): string => {
    const strength = getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Excellent';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
    if (!allRequirementsMet) {
      setError('Password does not meet all requirements');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/waitlist/signup-with-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?signup=success');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  };

  if (validatingToken) {
    return (
      <SignupContainer>
        <Container maxWidth="sm">
          <SignupCard>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
                mb: 3,
                animation: `${successPulse} 2s ease-in-out infinite`
              }}>
                <SportsMma sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Validating your invitation...
              </Typography>
              <LinearProgress sx={{ borderRadius: 2 }} />
            </CardContent>
          </SignupCard>
        </Container>
      </SignupContainer>
    );
  }

  if (success) {
    return (
      <SignupContainer>
        <Container maxWidth="sm">
          <SignupCard>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Avatar sx={{
                width: 100,
                height: 100,
                margin: '0 auto',
                background: `linear-gradient(135deg, ${athleticColors.victory} 0%, ${athleticColors.gold} 100())`,
                mb: 3,
                animation: `${successPulse} 1.5s ease-in-out infinite`
              }}>
                <EmojiEvents sx={{ fontSize: '3rem' }} />
              </Avatar>
              <Typography variant="h3" fontWeight={800} sx={{ 
                mb: 2,
                color: athleticColors.primary,
              }}>
                Welcome to Clip! 🎉
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                Your account has been created successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Redirecting you to sign in...
              </Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
            </CardContent>
          </SignupCard>
        </Container>
      </SignupContainer>
    );
  }

  if (error && !tokenData) {
    return (
      <SignupContainer>
        <Container maxWidth="sm">
          <SignupCard>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                background: '#ef4444',
                mb: 3,
              }}>
                <Cancel sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#dc2626' }}>
                Invalid Invitation
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100())`,
                  borderRadius: '12px',
                }}
              >
                Go to Sign In
              </Button>
            </CardContent>
          </SignupCard>
        </Container>
      </SignupContainer>
    );
  }

  return (
    <SignupContainer>
      <Container maxWidth="sm">
        <SignupCard>
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100())`,
                mb: 2,
              }}>
                <SportsMma sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              
              <Typography variant="h3" fontWeight={800} sx={{ 
                mb: 1,
                background: `linear-gradient(135deg, #0a2540 0%, ${athleticColors.primary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Complete Your Signup
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                Welcome to the Financial Athletics Platform!
              </Typography>

              {tokenData && (
                <Box sx={{ mb: 3 }}>
                  <Chip
                    icon={<Person />}
                    label={`Welcome, ${tokenData.name}`}
                    sx={{
                      background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100())`,
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <br />
                  <Chip
                    icon={<AccessTime />}
                    label={formatTimeRemaining(tokenData.expires_at)}
                    variant="outlined"
                    sx={{ color: athleticColors.primary, borderColor: athleticColors.primary }}
                  />
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <StyledTextField
                  fullWidth
                  label="Create Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: athleticColors.primary }} />
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
                  sx={{ mb: 1 }}
                />
                
                {password && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Password Strength: <strong>{getPasswordStrengthLabel()}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(getPasswordStrength())}%
                      </Typography>
                    </Box>
                    <PasswordStrengthBar
                      variant="determinate"
                      value={getPasswordStrength()}
                      strength={getPasswordStrength()}
                    />
                  </Box>
                )}
                
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: athleticColors.primary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2 }}
                />
              </Box>

              {/* Password Requirements */}
              <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Password Requirements:
                  </Typography>
                  <List dense>
                    <RequirementItem met={passwordRequirements.length}>
                      <ListItemIcon>
                        {passwordRequirements.length ? (
                          <CheckCircle sx={{ color: athleticColors.victory, fontSize: '1.2rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#6b7280', fontSize: '1.2rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="At least 8 characters" />
                    </RequirementItem>
                    <RequirementItem met={passwordRequirements.uppercase}>
                      <ListItemIcon>
                        {passwordRequirements.uppercase ? (
                          <CheckCircle sx={{ color: athleticColors.victory, fontSize: '1.2rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#6b7280', fontSize: '1.2rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One uppercase letter" />
                    </RequirementItem>
                    <RequirementItem met={passwordRequirements.lowercase}>
                      <ListItemIcon>
                        {passwordRequirements.lowercase ? (
                          <CheckCircle sx={{ color: athleticColors.victory, fontSize: '1.2rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#6b7280', fontSize: '1.2rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One lowercase letter" />
                    </RequirementItem>
                    <RequirementItem met={passwordRequirements.number}>
                      <ListItemIcon>
                        {passwordRequirements.number ? (
                          <CheckCircle sx={{ color: athleticColors.victory, fontSize: '1.2rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#6b7280', fontSize: '1.2rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One number" />
                    </RequirementItem>
                    <RequirementItem met={passwordRequirements.symbol}>
                      <ListItemIcon>
                        {passwordRequirements.symbol ? (
                          <CheckCircle sx={{ color: athleticColors.victory, fontSize: '1.2rem' }} />
                        ) : (
                          <Cancel sx={{ color: '#6b7280', fontSize: '1.2rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One symbol (!@#$%^&*)" />
                    </RequirementItem>
                  </List>
                </CardContent>
              </Card>

              <ActionButton
                fullWidth
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword || !Object.values(passwordRequirements).every(Boolean)}
                sx={{ mb: 3 }}
              >
                {loading ? 'Creating Your Account...' : 'Start Your Financial Training 🚀'}
              </ActionButton>
            </form>

            <Divider sx={{ my: 2 }} />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ color: athleticColors.primary, textTransform: 'none' }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </SignupCard>
      </Container>
    </SignupContainer>
  );
};

export default TokenSignup;