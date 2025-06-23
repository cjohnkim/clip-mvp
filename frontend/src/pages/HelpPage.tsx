import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Help,
  ExpandMore,
  Send,
  QuestionAnswer,
  Book,
  BugReport,
  Lightbulb,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HelpContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
}));

const HelpCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const FAQItem = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supportRequest, setSupportRequest] = useState({
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSupportSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!supportRequest.subject || !supportRequest.message) {
        setError('Please fill in both subject and message');
        return;
      }

      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/support/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...supportRequest,
          user_email: user?.email,
          user_name: user?.first_name || 'User',
        }),
      });

      if (response.ok) {
        setSuccess('✅ Support request submitted successfully! We\'ll get back to you within 24 hours.');
        setSupportRequest({ subject: '', message: '', category: 'general' });
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit support request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };

  const faqData = [
    {
      question: "How do I connect my bank account?",
      answer: "Click the 'Import Data' button on your dashboard to connect your bank account securely through Plaid. Your login credentials are never stored by Clip."
    },
    {
      question: "How is my daily allowance calculated?",
      answer: "Your daily allowance is calculated based on your current balance, fixed monthly expenses, and the number of days remaining in the month. It shows you how much you can safely spend each day."
    },
    {
      question: "Can I edit my balance manually?",
      answer: "Yes! Click on the balance amount in your dashboard to edit it manually. This is useful for cash accounts or accounts not connected through your bank."
    },
    {
      question: "What transaction categories are available?",
      answer: "Clip includes 30+ categories including Housing, Food, Transportation, Entertainment, Shopping, and more. You can also add custom notes to your transactions."
    },
    {
      question: "How do recurring transactions work?",
      answer: "When adding a transaction, you can mark it as recurring (daily, weekly, monthly, or yearly). Clip will factor these into your daily allowance calculations."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! Clip uses bank-level security with 256-bit encryption. We partner with Plaid for secure bank connections and never store your bank login credentials."
    },
    {
      question: "Can I export my transaction data?",
      answer: "Data export features are coming soon! For now, you can view all your transactions in the dashboard and contact support for data requests."
    },
    {
      question: "How do I change my password?",
      answer: "Go to your Profile page (click your avatar in the top right) and use the 'Change Password' option in the Security section."
    }
  ];

  const quickActions = [
    {
      title: "Getting Started",
      description: "Learn the basics of using Clip",
      icon: <Book />,
      action: () => navigate('/dashboard')
    },
    {
      title: "Report a Bug",
      description: "Found something that's not working?",
      icon: <BugReport />,
      action: () => setSupportRequest(prev => ({ ...prev, category: 'bug', subject: 'Bug Report: ' }))
    },
    {
      title: "Feature Request",
      description: "Suggest new features or improvements",
      icon: <Lightbulb />,
      action: () => setSupportRequest(prev => ({ ...prev, category: 'feature', subject: 'Feature Request: ' }))
    },
  ];

  return (
    <HelpContainer maxWidth="md">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="#00d4aa">
          Help & Support
        </Typography>
        <Button onClick={() => navigate('/dashboard')} variant="outlined">
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Quick Actions */}
      <HelpCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 212, 170, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: '#00d4aa', mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </HelpCard>

      {/* FAQ Section */}
      <HelpCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <QuestionAnswer color="primary" />
            Frequently Asked Questions
          </Typography>
          
          {faqData.map((faq, index) => (
            <FAQItem key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={500}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </FAQItem>
          ))}
        </CardContent>
      </HelpCard>

      {/* Contact Support */}
      <HelpCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <Help color="primary" />
            Contact Support
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={3}>
            Can't find what you're looking for? Send us a message and we'll help you out!
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={supportRequest.subject}
                onChange={(e) => setSupportRequest({ ...supportRequest, subject: e.target.value })}
                placeholder="Brief description of your question or issue"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Category
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['general', 'bug', 'feature', 'account'].map((category) => (
                    <Chip
                      key={category}
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                      variant={supportRequest.category === category ? "filled" : "outlined"}
                      onClick={() => setSupportRequest({ ...supportRequest, category })}
                      sx={{
                        backgroundColor: supportRequest.category === category ? '#00d4aa' : 'transparent',
                        color: supportRequest.category === category ? 'white' : '#00d4aa',
                        borderColor: '#00d4aa',
                        '&:hover': {
                          backgroundColor: supportRequest.category === category ? '#00b894' : 'rgba(0, 212, 170, 0.1)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                value={supportRequest.message}
                onChange={(e) => setSupportRequest({ ...supportRequest, message: e.target.value })}
                multiline
                rows={4}
                placeholder="Please describe your question or issue in detail..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSupportSubmit}
                disabled={loading || !supportRequest.subject || !supportRequest.message}
                sx={{
                  backgroundColor: '#00d4aa',
                  '&:hover': { backgroundColor: '#00b894' },
                  px: 3,
                  py: 1.5,
                }}
              >
                {loading ? 'Sending...' : 'Send Support Request'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </HelpCard>

      {/* Contact Info */}
      <Box textAlign="center" mt={4} mb={2}>
        <Typography variant="body2" color="text.secondary">
          Need immediate assistance? Our support team typically responds within 24 hours.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Support requests are sent to: cjohnkim+support-money-clip@gmail.com
        </Typography>
      </Box>
    </HelpContainer>
  );
};

export default HelpPage;