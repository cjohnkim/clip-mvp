import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const AboutContainer = styled(Box)(() => ({
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
  cursor: 'pointer',
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

const ContentSection = styled(Box)(() => ({
  padding: '80px 0',
  background: 'white',
}));

const ValueCard = styled(Card)(() => ({
  background: '#f8fafc',
  padding: '2rem',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  height: '100%',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleSignInClick = () => {
    window.location.href = 'https://app.moneyclip.money/auth';
  };

  const handleJoinWaitlistClick = () => {
    navigate('/');
  };

  const successStories = [
    {
      name: 'Sarah, Software Engineer',
      achievement: 'Built a $15K Emergency Fund',
      story: '"I was making $120K but living paycheck to paycheck. Clip showed me I could save $47/day without changing my lifestyle. 10 months later, I have a full emergency fund and feel unstoppable."',
      icon: '💪'
    },
    {
      name: 'Marcus, Product Manager', 
      achievement: 'Saved $40K for House Down Payment',
      story: '"The visual progress tracking made saving addictive. Seeing my daily wins pile up into serious money felt like leveling up in a game. I hit my house down payment goal 8 months early."',
      icon: '🏠'
    },
    {
      name: 'Alex, Designer',
      achievement: 'Broke the Debt Cycle', 
      story: '"Credit card debt kept me stressed for years. Clip\'s daily targets helped me save $30/day consistently. Paid off $8K in debt and now I\'m building wealth instead of digging deeper."',
      icon: '📈'
    },
    {
      name: 'Jordan, Marketing Lead',
      achievement: 'Travel Fund + Investment Growth',
      story: '"Saved $12K for dream Europe trip while building investment portfolio. Clip made it clear how much I could spend guilt-free while still hitting aggressive savings goals."',
      icon: '✈️'
    }
  ];

  return (
    <AboutContainer>
      {/* Header */}
      <Header>
        <Container maxWidth="lg">
          <HeaderContent>
            <Logo onClick={handleHomeClick}>Clip</Logo>
            <NavLinks>
              <LoginLink onClick={() => navigate('/about')}>
                About
              </LoginLink>
              <LoginLink onClick={handleSignInClick}>
                Sign In
              </LoginLink>
              <CTAButton onClick={handleJoinWaitlistClick}>
                Start Training
              </CTAButton>
            </NavLinks>
          </HeaderContent>
        </Container>
      </Header>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography 
            variant="h1" 
            sx={{ 
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
            }}
          >
            What Success Looks Like
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#64748b',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Real people using Clip to build wealth through daily wins. See what's possible when saving becomes a performance game.
          </Typography>
        </Container>
      </HeroSection>

      {/* Mission Section */}
      <ContentSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            The Financial Athlete Mindset
          </Typography>
          
          <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 8 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: '#475569',
                lineHeight: 1.6,
                textAlign: 'center',
                fontSize: '1.25rem'
              }}
            >
              Traditional budgeting feels like being put on a diet. Clip feels like training for something bigger.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Every dollar saved is a rep completed, every smart choice builds financial muscle. When money management becomes a performance game with clear targets and visible progress, everything changes.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Saving money is hard. Traditional budgets feel like punishment. Clip turns building wealth into a performance game with daily wins and clear progress.
            </Typography>
          </Box>
        </Container>
      </ContentSection>

      {/* Success Stories Section */}
      <Box sx={{ padding: '80px 0', background: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Real Success Stories
          </Typography>
          
          <Grid container spacing={4}>
            {successStories.map((story, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ValueCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ fontSize: '2rem', mr: 2 }}>{story.icon}</Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#0a2540', fontWeight: 600 }}>
                          {story.name}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: '#00d4aa', fontWeight: 600 }}>
                          {story.achievement}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography color="#64748b" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                      {story.story}
                    </Typography>
                  </CardContent>
                </ValueCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission Section */}
      <ContentSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Your Financial Transformation Starts Today
          </Typography>
          
          <Box sx={{ maxWidth: '700px', mx: 'auto', textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Every financial athlete started with Day 1. The difference isn't your income or your starting point - it's having a system that makes saving feel like winning.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Stop feeling guilty about money. Start building wealth through daily victories. Your future self will thank you for starting today.
            </Typography>
          </Box>
        </Container>
      </ContentSection>

      {/* CTA Section */}
      <Box sx={{ padding: '80px 0', background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 2 }}>
            Ready to train like a financial athlete?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join the waitlist and start building wealth through daily wins
          </Typography>
          <Button
            variant="contained"
            onClick={handleHomeClick}
            sx={{
              background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #00b894 0%, #009688 100%)',
              },
            }}
          >
            Start Training 🏃‍♂️
          </Button>
        </Container>
      </Box>
    </AboutContainer>
  );
};

export default AboutPage;