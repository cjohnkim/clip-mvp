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
  Divider,
  Link,
  Avatar,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  SportsMma,
  TrendingUp,
  EmojiEvents,
  LocalFireDepartment
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { athleticColors } from '../../theme/athleticTheme';

// Animations
const heroGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulseSuccess = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const HeroContainer = styled(Box)(() => ({
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

const SignInCard = styled(Card)(() => ({
  position: 'relative',
  zIndex: 2,
  borderRadius: '24px',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  animation: `${heroGlow} 3s ease-in-out infinite`,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
}));

const FloatingIcon = styled(Avatar)<{ delay?: number }>(({ delay = 0 }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
}));

const MotivationChip = styled(Chip)(() => ({
  background: `linear-gradient(135deg, ${athleticColors.victory} 0%, ${athleticColors.gold} 100%)`,
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
  animation: `${pulseSuccess} 2s ease-in-out infinite`,
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
  const [isSignIn, setIsSignIn] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await onLogin(email, password);
    }
  };

  const motivationalMessages = [
    "Your financial transformation starts here! 💪",
    "Ready to become a Money Athlete? 🏆",
    "Every champion was once a beginner! 🚀",
    "Your future self will thank you! ⭐"
  ];

  const [currentMessage] = useState(
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  return (
    <HeroContainer>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Floating Achievement Icons */}
        <Box sx={{ position: 'absolute', top: -100, left: -50 }}>
          <FloatingIcon delay={0}>
            <EmojiEvents sx={{ fontSize: '2rem' }} />
          </FloatingIcon>
        </Box>
        <Box sx={{ position: 'absolute', top: -80, right: -30 }}>
          <FloatingIcon delay={1}>
            <LocalFireDepartment sx={{ fontSize: '2rem' }} />
          </FloatingIcon>
        </Box>
        <Box sx={{ position: 'absolute', bottom: -120, left: 20 }}>
          <FloatingIcon delay={2}>
            <TrendingUp sx={{ fontSize: '2rem' }} />
          </FloatingIcon>
        </Box>

        <SignInCard elevation={0}>
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
                  mb: 2,
                  animation: `${pulseSuccess} 2s ease-in-out infinite`
                }}>
                  <SportsMma sx={{ fontSize: '2.5rem' }} />
                </Avatar>
              </Box>
              
              <Typography variant="h3" fontWeight={800} sx={{ 
                mb: 1,
                background: `linear-gradient(135deg, #0a2540 0%, ${athleticColors.primary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Money Clip
              </Typography>
              
              <Typography variant="h5" sx={{ 
                mb: 2, 
                color: athleticColors.primary,
                fontWeight: 600
              }}>
                Financial Athletics Platform
              </Typography>
              
              <MotivationChip 
                label={currentMessage}
                icon={<SportsMma />}
                sx={{ mb: 3 }}
              />
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
                        <Email sx={{ color: athleticColors.primary }} />
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
                  borderRadius: '12px',
                  padding: '12px 24px',
                  borderColor: athleticColors.primary,
                  color: athleticColors.primary,
                  fontWeight: 600,
                  textTransform: 'none',
                  
                  '&:hover': {
                    borderColor: athleticColors.victory,
                    color: athleticColors.victory,
                    background: 'rgba(16, 185, 129, 0.05)',
                    transform: 'translateY(-2px)',
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