import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, TextField, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)',
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
  transition: 'transform 0.2s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
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
}));

const CTASection = styled(Box)(() => ({
  padding: '80px 0',
  background: 'white',
  textAlign: 'center',
}));

const LandingPage: React.FC = () => {
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
      title: 'Daily Insights',
      description: 'See exactly where your money goes each day. Clear, simple tracking without complex categories or judgmental budgets.'
    },
    {
      icon: '📈',
      title: 'Progress Tracking',
      description: 'Visual progress towards your goals. See how your spending decisions impact your financial timeline.'
    },
    {
      icon: '🎯',
      title: 'Smart Planning',
      description: 'Test scenarios before big purchases. See exactly how that vacation or expense affects your goals.'
    },
    {
      icon: '✨',
      title: 'Simple Interface',
      description: 'Clean design that gets out of your way. Focus on insights, not complicated features.'
    },
    {
      icon: '💡',
      title: 'Actionable Data',
      description: 'Get insights that actually help you make better decisions. No overwhelming charts or confusing metrics.'
    },
    {
      icon: '📱',
      title: 'Effortless Design',
      description: 'Professional interface built for busy people. Simple, clean, and effective.'
    }
  ];

  const targetAudiences = [
    {
      title: 'Busy Professionals',
      description: 'People who want financial clarity without spending hours on budget management'
    },
    {
      title: 'Goal-Oriented',
      description: 'Those who have specific financial goals and want to track progress simply'
    },
    {
      title: 'Data-Driven',
      description: 'People who make decisions based on clear information, not emotions'
    },
    {
      title: 'Simplicity Seekers',
      description: 'Anyone tired of complex budgeting apps and wants something that just works'
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
          <HeroTitle>Daily spending insights that actually work</HeroTitle>
          <HeroSubtitle>Simple financial progress tracking</HeroSubtitle>
          <HeroDescription>
            See exactly how your spending affects your goals. Clean insights without judgment. 
            Progress tracking that feels effortless.
          </HeroDescription>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            Join Waitlist
          </CTAButton>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Simple spending insights
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

      {/* Target Audience Section */}
      <TargetSection>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 3 }}>
            Built for professionals who want clarity
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}>
            Clean financial insights without the complexity. 
            Clip gives you the clarity you need to make smart spending decisions.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {targetAudiences.map((audience, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <TargetItem>
                  <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontWeight: 600 }}>
                    {audience.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {audience.description}
                  </Typography>
                </TargetItem>
              </Grid>
            ))}
          </Grid>
        </Container>
      </TargetSection>

      {/* Final CTA Section */}
      <CTASection>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 2, color: '#0a2540' }}>
            Ready to simplify your finances?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#64748b' }}>
            Join the waitlist for daily spending insights that actually work
          </Typography>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px', mb: 2 }}
          >
            Join the Waitlist
          </CTAButton>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Early access • Email notification when ready • Simple financial clarity
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
                Join the Clip Waitlist
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#64748b' }}>
                Get early access to daily spending insights
              </Typography>
              
              {success ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" sx={{ color: '#059669', mb: 2 }}>
                    You're on the list!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    We'll notify you when Clip is ready to launch.
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