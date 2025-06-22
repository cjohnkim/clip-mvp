import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, TextField, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const LandingContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: '#f8fafc',
}));

const Header = styled(Box)(() => ({
  background: 'white',
  padding: '1rem 0',
  borderBottom: '1px solid #f1f5f9',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}));

const HeaderContent = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Logo = styled(Typography)(() => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#00d4aa',
}));

const NavLinks = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
}));

const LoginLink = styled(Button)(() => ({
  color: '#0a2540',
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: '6px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

const CTAButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #00b894 0%, #009688 100%)',
  },
}));

const HeroSection = styled(Box)(() => ({
  padding: '80px 0',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
}));

const HeroTitle = styled(Typography)(() => ({
  fontSize: '3.5rem',
  fontWeight: 800,
  marginBottom: '1rem',
  background: 'linear-gradient(135deg, #0a2540 0%, #00d4aa 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  
  '@media (max-width: 768px)': {
    fontSize: '2.5rem',
  },
}));

const HeroSubtitle = styled(Typography)(() => ({
  fontSize: '1.5rem',
  color: '#64748b',
  marginBottom: '2rem',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  
  '@media (max-width: 768px)': {
    fontSize: '1.2rem',
  },
}));

const HeroDescription = styled(Typography)(() => ({
  fontSize: '1.1rem',
  color: '#475569',
  marginBottom: '3rem',
  maxWidth: '700px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const FeaturesSection = styled(Box)(() => ({
  padding: '80px 0',
  background: 'white',
}));

const FeatureCard = styled(Card)(() => ({
  background: '#f8fafc',
  padding: '2rem',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  height: '100%',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const FeatureIcon = styled(Typography)(() => ({
  fontSize: '2.5rem',
  marginBottom: '1rem',
}));

const TargetSection = styled(Box)(() => ({
  padding: '80px 0',
  background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)',
  color: 'white',
  textAlign: 'center',
}));

const TargetItem = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '1.5rem',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const CTASection = styled(Box)(() => ({
  padding: '80px 0',
  background: 'white',
  textAlign: 'center',
}));

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSignInClick = () => {
    window.location.href = 'https://app.moneyclip.money/auth';
  };

  const handleJoinWaitlistClick = () => {
    setShowWaitlist(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          source: 'landing_page'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setName('');
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '📊',
      title: 'Daily Performance',
      description: 'Track your spending like an athlete tracks workouts. Clear daily insights that show exactly how you\'re performing against your goals.'
    },
    {
      icon: '📈',
      title: 'Build Momentum',
      description: 'See your financial progress in real-time. Watch your money habits improve as you build winning streaks and hit your targets.'
    },
    {
      icon: '🎯',
      title: 'Smart Strategy',
      description: 'Test scenarios before big moves. See exactly how that purchase impacts your game plan and adjust accordingly.'
    },
    {
      icon: '🏆',
      title: 'Level Up',
      description: 'Progress through financial milestones with clear achievements. Make saving and smart spending feel like winning.'
    },
    {
      icon: '💡',
      title: 'Winning Insights',
      description: 'Get the data you need to make champion-level money decisions. No confusion, just clear paths to victory.'
    },
    {
      icon: '📱',
      title: 'Athlete-Grade Tools',
      description: 'Professional-grade financial training tools designed for people who want to excel with money.'
    }
  ];


  return (
    <LandingContainer>
      {/* Header */}
      <Header>
        <Container maxWidth="lg">
          <HeaderContent>
            <Logo>Clip</Logo>
            <NavLinks>
              <LoginLink onClick={() => navigate('/about')}>
                About
              </LoginLink>
              <LoginLink onClick={handleSignInClick}>
                Sign In
              </LoginLink>
              <CTAButton onClick={handleJoinWaitlistClick}>
                Join Waitlist
              </CTAButton>
            </NavLinks>
          </HeaderContent>
        </Container>
      </Header>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroTitle>Train Like a Financial Athlete</HeroTitle>
          <HeroSubtitle>Saving money is hard. Traditional budgets feel like punishment.</HeroSubtitle>
          <HeroDescription>
            Clip turns building wealth into a performance game with daily wins and clear progress. 
            Every dollar saved is a rep completed, every smart choice builds financial muscle.
          </HeroDescription>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            Start Training 🏃‍♂️
          </CTAButton>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Your Financial Training Platform
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <FeatureCard>
                  <CardContent>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <Typography variant="h5" sx={{ mb: 2, color: '#0a2540', fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="#64748b" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FeaturesSection>

      {/* Problem Section */}
      <TargetSection>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 3 }}>
            Why Saving Money Is So Hard
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}>
            You know you should save more, but traditional apps make it feel impossible. 
            They're full of guilt, restrictions, and complicated budgets that don't fit real life.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TargetItem>
                <Typography sx={{ fontSize: '2rem', mb: 2 }}>😤</Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontWeight: 600 }}>
                  Budgets feel like punishment
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Traditional budgeting feels like being put on a financial diet. You're told what you can't have instead of being shown what you can achieve.
                </Typography>
              </TargetItem>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TargetItem>
                <Typography sx={{ fontSize: '2rem', mb: 2 }}>📊</Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontWeight: 600 }}>
                  Progress is invisible
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  You save $20 here and there, but it doesn't feel like progress. Small wins get lost in spreadsheets and account balances.
                </Typography>
              </TargetItem>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TargetItem>
                <Typography sx={{ fontSize: '2rem', mb: 2 }}>🤷‍♂️</Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontWeight: 600 }}>
                  No clear training plan
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Every expert says "just save more" but nobody gives you a daily practice. How much today? What's the next milestone?
                </Typography>
              </TargetItem>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TargetItem>
                <Typography sx={{ fontSize: '2rem', mb: 2 }}>🎯</Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontWeight: 600 }}>
                  All goals feel impossible
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  $10K for emergencies? $100K for a house? These numbers feel so big that starting feels pointless.
                </Typography>
              </TargetItem>
            </Grid>
          </Grid>
        </Container>
      </TargetSection>

      {/* Benefits Section */}
      <Box sx={{ padding: '80px 0', background: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 3, color: '#0a2540' }}>
            Train Your Way to Financial Strength
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 6, color: '#64748b', maxWidth: '700px', mx: 'auto' }}>
            Clip treats saving like athletic training. Every day you get a clear target, see your progress, and build the discipline that creates real wealth.
          </Typography>
          
          <Grid container spacing={4} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ fontSize: '1.5rem', mr: 2, mt: 0.5 }}>💪</Box>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                  Daily spending targets that build saving muscle memory
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ fontSize: '1.5rem', mr: 2, mt: 0.5 }}>🏆</Box>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                  Visual progress that makes every dollar saved feel like a victory
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ fontSize: '1.5rem', mr: 2, mt: 0.5 }}>📈</Box>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                  Clear milestones that break big goals into achievable steps
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ fontSize: '1.5rem', mr: 2, mt: 0.5 }}>🔥</Box>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                  Performance tracking that shows your financial fitness improving
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <CTASection>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 2, color: '#0a2540' }}>
            Ready to become a financial athlete?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#64748b' }}>
            Join the waitlist and start training your money habits
          </Typography>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px', mb: 2 }}
          >
            Start Training
          </CTAButton>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Join the financial athletes • Email when ready • Turn saving into winning
          </Typography>
        </Container>
      </CTASection>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={() => setShowWaitlist(false)}
        >
          <Card
            sx={{ maxWidth: 500, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', color: '#0a2540' }}>
                Join the Financial Training
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#64748b' }}>
                Be first in line to train your money like an athlete
              </Typography>
              
              {success ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" sx={{ color: '#059669', mb: 2 }}>
                    Welcome to the team!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    We'll notify you when training begins.
                  </Typography>
                  <Button onClick={() => setShowWaitlist(false)} variant="contained">
                    Close
                  </Button>
                </Box>
              ) : (
                <form onSubmit={handleWaitlistSubmit}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    required
                  />
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      onClick={() => setShowWaitlist(false)}
                      variant="outlined"
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !email || !name}
                      sx={{
                        background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Join Waitlist'}
                    </Button>
                  </Box>
                </form>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </LandingContainer>
  );
};

export default LandingPage;