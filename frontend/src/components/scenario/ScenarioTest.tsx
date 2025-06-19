import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
import { calculationService } from '../../services/calculationService';

interface ScenarioResult {
  current_clip: number;
  new_clip: number;
  impact: number;
  scenario_expense: number;
  recommendation: string;
  days_affected: number;
}

export default function ScenarioTest() {
  const navigate = useNavigate();
  const [expenseAmount, setExpenseAmount] = useState('');
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestScenario = async () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await calculationService.testScenario(parseFloat(expenseAmount));
      setScenarioResult(response.data.scenario);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to test scenario');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getResultColor = (newClip: number) => {
    if (newClip >= 20) return 'success.main';
    if (newClip >= 0) return 'warning.main';
    if (newClip >= -10) return 'orange';
    return 'error.main';
  };

  const getRecommendationSeverity = (recommendation: string | undefined) => {
    if (!recommendation) return 'info';
    if (recommendation.includes('✅')) return 'success';
    if (recommendation.includes('⚠️')) return 'warning';
    if (recommendation.includes('❌')) return 'error';
    if (recommendation.includes('🚨')) return 'error';
    return 'info';
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

      <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            "What If" Expense Test
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Test how a potential expense would impact your daily spending capacity
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Expense Amount"
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleTestScenario}
              disabled={loading || !expenseAmount}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Test Scenario'}
            </Button>
          </Box>

          {scenarioResult && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Scenario Results
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Current Daily Clip
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(scenarioResult.current_clip)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        New Daily Clip
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ color: getResultColor(scenarioResult.new_clip) }}
                      >
                        {formatCurrency(scenarioResult.new_clip)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert 
                severity={getRecommendationSeverity(scenarioResult.recommendation)}
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" gutterBottom>
                  {scenarioResult.recommendation || 'Analysis complete'}
                </Typography>
                <Typography variant="body2">
                  This {formatCurrency(scenarioResult.scenario_expense)} expense would reduce your daily clip by {formatCurrency(scenarioResult.impact)} over the next {scenarioResult.days_affected} days.
                </Typography>
              </Alert>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setExpenseAmount('');
                    setScenarioResult(null);
                  }}
                >
                  Test Another Amount
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/planning')}
                >
                  Add This Expense
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}