import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
} from '@mui/material';
import { planningService } from '../../services/planningService';

const steps = ['Account Balance', 'Paycheck Schedule', 'Complete'];

export default function Setup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account setup
  const [accountName, setAccountName] = useState('Main Account');
  const [currentBalance, setCurrentBalance] = useState('');

  // Paycheck setup
  const [paycheckName, setPaycheckName] = useState('Paycheck');
  const [paycheckAmount, setPaycheckAmount] = useState('');
  const [frequency, setFrequency] = useState('bi-weekly');
  const [nextDate, setNextDate] = useState('');

  const handleNext = async () => {
    setError('');
    setLoading(true);

    try {
      if (activeStep === 0) {
        // Create account
        await planningService.createAccount({
          name: accountName,
          current_balance: parseFloat(currentBalance),
          is_primary: true,
        });
      } else if (activeStep === 1) {
        // Create paycheck schedule
        await planningService.createPaycheckSchedule({
          name: paycheckName,
          amount: parseFloat(paycheckAmount),
          frequency: frequency,
          next_date: nextDate,
        });
      }

      if (activeStep === steps.length - 1) {
        navigate('/dashboard');
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getNextWeekdayDate = (daysAhead: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return accountName.trim() && currentBalance && !isNaN(parseFloat(currentBalance));
    }
    if (activeStep === 1) {
      return paycheckName.trim() && paycheckAmount && !isNaN(parseFloat(paycheckAmount)) && nextDate;
    }
    return true;
  };

  React.useEffect(() => {
    // Set default next paycheck date to next Friday
    if (!nextDate) {
      const today = new Date();
      const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
      setNextDate(getNextWeekdayDate(daysUntilFriday));
    }
  }, [nextDate]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              What's your financial starting point?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We'll calculate your daily spending power and help you optimize your cash flow.
            </Typography>
            <TextField
              fullWidth
              label="Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Current Balance"
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              margin="normal"
              disabled={loading}
              helperText="Enter your current account balance (e.g., 1500.00)"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Let's optimize your income timing
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We'll factor this into your daily financial performance calculations.
            </Typography>
            <TextField
              fullWidth
              label="Paycheck Name"
              value={paycheckName}
              onChange={(e) => setPaycheckName(e.target.value)}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Paycheck Amount"
              type="number"
              value={paycheckAmount}
              onChange={(e) => setPaycheckAmount(e.target.value)}
              margin="normal"
              disabled={loading}
              helperText="Enter your net paycheck amount (after taxes)"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Frequency</InputLabel>
              <Select
                value={frequency}
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="bi-weekly">Bi-weekly (every 2 weeks)</MenuItem>
                <MenuItem value="semi-monthly">Semi-monthly (twice a month)</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Next Paycheck Date"
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              margin="normal"
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom>
              Ready to level up! 🚀
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You're all set! Clip will now track your daily spending power and help you
              optimize your financial performance.
            </Typography>
            <Typography variant="h6" gutterBottom>
              Next steps:
            </Typography>
            <Typography variant="body2" component="div" sx={{ textAlign: 'left', mt: 2 }}>
              • Track your spending moves as you plan them<br />
              • Check your daily power level regularly<br />
              • Test scenarios before major financial moves
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'white',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              cursor: 'pointer',
              color: '#00d4aa',
              fontWeight: 600,
              fontSize: '1.25rem',
              fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
              flexGrow: 1,
            }}
            onClick={() => navigate('/dashboard')}
          >
            Clip
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Welcome to Clip
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Level up your financial game in 2 minutes
          </Typography>

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }} disabled={loading}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid() || loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Go to Dashboard'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
    </>
  );
}