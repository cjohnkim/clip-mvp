import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
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
  const handleSignInClick = () => {
    window.location.href = 'https://app.moneyclip.money/auth';
  };

  const handleJoinWaitlistClick = () => {
    window.location.href = 'https://app.moneyclip.money/auth?mode=waitlist';
  };

  const features = [
    {
      icon: '⚡',
      title: 'Daily Spending Power',
      description: 'See exactly how much financial power you have each day. No complex budgets - just clear, actionable numbers that help you make smart spending decisions.'
    },
    {
      icon: '📈',
      title: 'Performance Tracking',
      description: 'Gamify your savings with visual performance metrics. Watch your financial momentum build as you level up your money game day by day.'
    },
    {
      icon: '🎯',
      title: 'Scenario Modeling',
      description: 'Test "what if" scenarios before making big financial moves. See exactly how that vacation or purchase affects your cash flow timeline.'
    },
    {
      icon: '🔥',
      title: 'Momentum Building',
      description: 'Turn saving into a streak game. Visual progress tracking that makes building financial discipline feel like leveling up in your favorite app.'
    },
    {
      icon: '💡',
      title: 'Smart Optimization',
      description: 'Get intelligent insights about your spending patterns without judgmental budget categories. Focus on optimization, not restriction.'
    },
    {
      icon: '📱',
      title: 'Effortless Design',
      description: 'Clean, professional interface that matches your lifestyle. No toy-like budgeting apps - this feels like a tool built for professionals.'
    }
  ];

  const targetAudiences = [
    {
      title: 'Tech Professionals',
      description: 'Software engineers, product managers, designers who want to optimize their financial performance'
    },
    {
      title: 'Finance & Consulting',
      description: 'Analysts, consultants, bankers who think in metrics and want data-driven financial tools'
    },
    {
      title: 'Young Professionals',
      description: 'High earners in expensive cities who need sophisticated cash flow management'
    },
    {
      title: 'Performance-Oriented',
      description: 'Anyone who optimizes everything else in their life and wants to level up their money game'
    }
  ];

  return (
    <LandingContainer>
      {/* Header */}
      <Header>
        <Container maxWidth="lg">
          <HeaderContent>
            <Logo>💪 Money Clip</Logo>
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
          <HeroTitle>Transform Into a Financial Athlete</HeroTitle>
          <HeroSubtitle>Performance-driven financial training for achievers</HeroSubtitle>
          <HeroDescription>
            Turn your money habits into athletic performance. Get scored daily, build streaks, unlock achievements, 
            and level up your financial fitness. No lectures - just results that feel like winning.
          </HeroDescription>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            Join the Training Camp 🏆
          </CTAButton>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Built for Financial Athletes
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
            Perfect for High Earners Who Want More
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}>
            Making $150K+ but still feeling financially behind? You're not alone. Traditional budgeting apps treat you like you're broke. 
            Money Clip treats you like the high performer you are.
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
            Ready to Become a Financial Athlete?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#64748b' }}>
            Join the waitlist and transform your money habits into winning performance
          </Typography>
          <CTAButton 
            onClick={handleJoinWaitlistClick}
            sx={{ fontSize: '1.2rem', padding: '16px 32px', mb: 2 }}
          >
            Join the Waitlist
          </CTAButton>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Early access • Email notification when ready • Start your training journey
          </Typography>
        </Container>
      </CTASection>
    </LandingContainer>
  );
};

export default LandingPage;