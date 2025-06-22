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
  SportsMma,
  EmojiEvents,
  CheckCircle,
  TrendingUp,
  LocalFireDepartment
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { athleticColors } from '../../theme/athleticTheme';

// Animations
const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const WaitlistContainer = styled(Box)(() => ({
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

const WaitlistCard = styled(Card)(() => ({
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

const FloatingIcon = styled(Avatar)<{ delay?: number }>(({ delay = 0 }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
}));

const FeatureChip = styled(Chip)(() => ({
  background: `linear-gradient(135deg, ${athleticColors.victory} 0%, ${athleticColors.gold} 100%)`,
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
  margin: '4px',
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

const SuccessDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
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
      
      // TEMP FIX: Use Railway backend directly
      const response = await fetch(`https://clip-mvp-production.up.railway.app/api/waitlist/join`, {
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

  const features = [
    { icon: '🎯', label: 'Performance Scoring' },
    { icon: '🔥', label: 'Streak Tracking' },
    { icon: '🏆', label: '25+ Achievements' },
    { icon: '📈', label: 'Athletic Analytics' },
    { icon: '💪', label: 'Level System' },
    { icon: '🎮', label: 'Gamified Experience' }
  ];

  return (
    <WaitlistContainer>
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

        <WaitlistCard elevation={0}>
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
                  animation: `${successPulse} 2s ease-in-out infinite`
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
                Join the Financial Athletics Revolution
              </Typography>
              
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontWeight: 500
              }}>
                Transform your money habits into athletic performance
              </Typography>
            </Box>

            {/* Features Grid */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, color: athleticColors.primary, fontWeight: 600 }}>
                What You'll Get:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                {features.map((feature, index) => (
                  <FeatureChip
                    key={index}
                    label={`${feature.icon} ${feature.label}`}
                    size="small"
                  />
                ))}
              </Box>
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
                        <Person sx={{ color: athleticColors.primary }} />
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
                        <Email sx={{ color: athleticColors.primary }} />
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
                    Joining Training Camp...
                  </>
                ) : (
                  '🚀 Join the Waitlist'
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
                  color: athleticColors.primary,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'rgba(16, 185, 129, 0.05)',
                  }
                }}
              >
                Sign In to Training Portal
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
          <Avatar sx={{
            width: 80,
            height: 80,
            margin: '0 auto',
            background: `linear-gradient(135deg, ${athleticColors.victory} 0%, ${athleticColors.gold} 100%)`,
            mb: 2,
            animation: `${successPulse} 1.5s ease-in-out infinite`
          }}>
            <CheckCircle sx={{ fontSize: '3rem' }} />
          </Avatar>
          <Typography variant="h4" fontWeight={700} sx={{ color: athleticColors.primary }}>
            Welcome to the Team! 🎉
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            You're officially in the training camp!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We'll notify you via email when your spot opens up. Get ready to transform your financial habits into athletic performance!
          </Typography>
          
          <Box sx={{ 
            background: 'rgba(16, 185, 129, 0.05)', 
            borderRadius: '12px', 
            p: 2, 
            border: `1px solid ${athleticColors.primary}20` 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: athleticColors.primary }}>
              💡 Pro Tip: Follow us on social media for training tips and early access content!
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            onClick={() => setSuccessDialogOpen(false)}
            sx={{
              background: `linear-gradient(135deg, ${athleticColors.primary} 0%, ${athleticColors.victory} 100%)`,
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Got it! 💪
          </Button>
        </DialogActions>
      </SuccessDialog>
    </WaitlistContainer>
  );
};

export default WaitlistSignup;