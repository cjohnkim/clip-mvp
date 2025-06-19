import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { AccountCircle, Add, Settings, Info } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { calculationService } from '../../services/calculationService';

interface DailyClip {
  daily_clip: number;
  current_balance: number;
  days_remaining: number;
  upcoming_expenses: number;
  expected_income: number;
  net_available: number;
  mode: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dailyClip, setDailyClip] = useState<DailyClip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadDailyClip();
  }, []);

  const loadDailyClip = async () => {
    try {
      setLoading(true);
      const response = await calculationService.getDailyClip('end_of_month');
      setDailyClip(response.data.daily_clip);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load daily clip');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getClipColor = (amount: number) => {
    if (amount >= 50) return 'success.main';
    if (amount >= 20) return 'warning.main';
    if (amount >= 0) return 'orange';
    return 'error.main';
  };

  const getClipMessage = (amount: number) => {
    if (amount >= 50) return 'Crushing it! Level up with some strategic saves 🚀';
    if (amount >= 20) return 'Strong performance! Keep building momentum 📈';
    if (amount >= 0) return 'Good baseline - optimize for higher daily power ⚡';
    return 'Time to level up your financial game 🎯';
  };

  const calculateYesterdaySavings = () => {
    // Mock calculation - in real implementation, this would:
    // 1. Get yesterday's allowance amount
    // 2. Get yesterday's actual spending
    // 3. Return the difference
    
    // For now, return a mock positive savings amount
    const mockYesterdayAllowance = dailyClip ? dailyClip.daily_clip * 0.9 : 45;
    const mockYesterdaySpent = mockYesterdayAllowance * 0.7; // Spent 70% of allowance
    const savings = mockYesterdayAllowance - mockYesterdaySpent;
    
    return savings > 0 ? savings : 0;
  };

  const getSavingsMessage = () => {
    const savings = calculateYesterdaySavings();
    if (savings > 0) {
      return `+${formatCurrency(savings)} banked yesterday! 🔥`;
    }
    return "Ready to level up your financial game? 💪";
  };

  const handleBalanceClick = () => {
    setNewBalance('');
    setBalanceDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    try {
      const balance = parseFloat(newBalance);
      if (isNaN(balance)) {
        setError('Please enter a valid balance amount');
        return;
      }
      
      console.log('Updating balance to:', balance);
      const updateResponse = await calculationService.updatePrimaryAccountBalance(balance);
      console.log('Update response:', updateResponse);
      
      setBalanceDialogOpen(false);
      
      // Add a small delay to ensure database is updated before refresh
      setTimeout(async () => {
        setLoading(true);
        const response = await calculationService.getDailyClip('end_of_month', true);
        console.log('Daily clip response after update:', response.data);
        setDailyClip(response.data.daily_clip);
        setLoading(false);
      }, 200);
    } catch (err: any) {
      console.error('Balance update error:', err);
      setError('Failed to update balance');
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
              flexGrow: 1,
              color: '#00d4aa',
              fontWeight: 600,
              fontSize: '1.25rem',
              fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
            }}
          >
            Clip
          </Typography>
          <IconButton
            size="large"
            aria-label="account menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{ color: '#666' }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/planning')}>Planning</MenuItem>
            <MenuItem onClick={() => navigate('/setup')}>Setup Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={loadDailyClip} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        ) : dailyClip ? (
          <Grid container spacing={3}>
            {/* Main Daily Spend Display */}
            <Grid item xs={12} md={8}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 212, 170, 0.15)',
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 700,
                      mb: 1,
                      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                    }}
                  >
                    {formatCurrency(dailyClip.daily_clip)}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9,
                        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Daily Spending Power
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      onClick={() => setDetailsDialogOpen(true)}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 0.9,
                        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                        fontWeight: 500,
                        textAlign: 'center',
                      }}
                    >
                      {getSavingsMessage()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease',
                      }
                    }} 
                    onClick={handleBalanceClick}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: '#0a2540',
                          fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        Financial Power
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: '#00d4aa', 
                          fontWeight: 700,
                          fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                        }}
                      >
                        {formatCurrency(dailyClip.current_balance)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#666',
                          fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                          fontWeight: 400,
                        }}
                      >
                        Click to update
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: '#0a2540',
                          fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        Days to Level Up
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: '#00d4aa', 
                          fontWeight: 700,
                          fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                        }}
                      >
                        {dailyClip.days_remaining}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Action Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/planning')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Add fontSize="large" color="primary" />
                      <Typography variant="h6" gutterBottom>
                        Track Spending
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Plan your financial moves
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/planning?tab=income')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Add fontSize="large" color="success" />
                      <Typography variant="h6" gutterBottom>
                        Boost Income
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Plan incoming cash flow
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/scenario')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Settings fontSize="large" color="action" />
                      <Typography variant="h6" gutterBottom>
                        Scenario Test
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Model financial moves
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/timeline')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Settings fontSize="large" color="action" />
                      <Typography variant="h6" gutterBottom>
                        Momentum
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track your financial wins
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Ready to level up your money game? 🚀
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Let's set up your financial performance dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              The setup takes just 2 minutes:
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              • Connect your financial accounts<br />
              • Set up your income streams<br />
              • Start optimizing your cash flow
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/setup')}
              sx={{ mt: 2 }}
            >
              Start Optimizing
            </Button>
          </Paper>
        )}

        {/* Balance Update Dialog */}
        <Dialog open={balanceDialogOpen} onClose={() => setBalanceDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Current Balance</DialogTitle>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateBalance(); }}>
            <DialogContent>
              <TextField
                fullWidth
                label="New Balance"
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                margin="normal"
                inputProps={{
                  step: "0.01",
                  min: "0"
                }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                helperText="Enter your new account balance"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUpdateBalance();
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBalanceDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update Balance
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Calculation Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            How Your Daily Spending Power is Calculated
          </DialogTitle>
          <DialogContent>
            {dailyClip && (
              <Box sx={{ py: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                    Current Financial Snapshot
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Current Balance:</strong> {formatCurrency(dailyClip.current_balance)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Days Remaining ({dailyClip.mode}):</strong> {dailyClip.days_remaining} days
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Expected Income:</strong> +{formatCurrency(dailyClip.expected_income)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Upcoming Expenses:</strong> -{formatCurrency(dailyClip.upcoming_expenses)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="success.main" fontWeight={600}>
                    Calculation
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Net Available:</strong> {formatCurrency(dailyClip.current_balance)} + {formatCurrency(dailyClip.expected_income)} - {formatCurrency(dailyClip.upcoming_expenses)} = {formatCurrency(dailyClip.net_available)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Daily Spending Power:</strong> {formatCurrency(dailyClip.net_available)} ÷ {dailyClip.days_remaining} days = <strong>{formatCurrency(dailyClip.daily_clip)}</strong>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.dark">
                    💡 <strong>Pro Tip:</strong> This is your safe-to-spend amount each day to reach your next paycheck or end of month with your planned expenses covered.
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)} variant="contained">
              Got it!
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}