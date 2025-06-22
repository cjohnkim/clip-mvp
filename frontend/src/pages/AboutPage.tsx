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

const BackButton = styled(Button)(() => ({
  color: '#0a2540',
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: '6px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f1f5f9',
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

  const values = [
    {
      title: 'Performance-Driven',
      description: 'We believe money management should feel like athletic training - focused on improvement, progress, and winning.'
    },
    {
      title: 'Clarity Over Complexity',
      description: 'Clean insights without overwhelming charts. Get the data you need to make smart decisions, nothing more.'
    },
    {
      title: 'Built for Winners',
      description: 'Designed for people who refuse to settle for "good enough" and want to excel in every area of life.'
    },
    {
      title: 'Daily Excellence',
      description: 'Small, consistent actions compound into major results. We help you build winning money habits daily.'
    }
  ];

  return (
    <AboutContainer>
      {/* Header */}
      <Header>
        <Container maxWidth="lg">
          <HeaderContent>
            <Logo onClick={handleHomeClick}>Clip</Logo>
            <BackButton onClick={handleHomeClick}>
              ← Back to Home
            </BackButton>
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
            About Clip
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
            Financial training for people who want to win
          </Typography>
        </Container>
      </HeroSection>

      {/* Mission Section */}
      <ContentSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Our Mission
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
              Most budgeting apps treat you like you're broke. We treat you like the high performer you are.
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
              Clip is built for ambitious people who want to apply the same discipline to their money that they do to everything else. We believe financial management should feel like athletic training - focused on performance, progress, and continuous improvement.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Instead of judgmental budget categories and overwhelming charts, we provide clean daily insights that help you make champion-level money decisions. Build momentum, track your progress, and level up your financial game.
            </Typography>
          </Box>
        </Container>
      </ContentSection>

      {/* Values Section */}
      <Box sx={{ padding: '80px 0', background: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            What We Believe
          </Typography>
          
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ValueCard>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 2, color: '#0a2540', fontWeight: 600 }}>
                      {value.title}
                    </Typography>
                    <Typography color="#64748b" sx={{ lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </ValueCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <ContentSection>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 6, color: '#0a2540' }}>
            Built by Financial Athletes
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
              We're a team of high performers who got tired of budgeting apps that felt like punishment. 
              We wanted something that felt like training - focused on improvement, not restriction.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                lineHeight: 1.7,
                fontSize: '1.1rem'
              }}
            >
              Clip is the financial tool we built for ourselves, and now we're sharing it with other people 
              who refuse to settle for mediocre money management.
            </Typography>
          </Box>
        </Container>
      </ContentSection>

      {/* CTA Section */}
      <Box sx={{ padding: '80px 0', background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 2 }}>
            Ready to train your money?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join the waitlist and start your financial training journey
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
            Join the Waitlist
          </Button>
        </Container>
      </Box>
    </AboutContainer>
  );
};

export default AboutPage;