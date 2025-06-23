import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Add,
  AccountBalance,
  TrendingUp,
  Receipt,
  CloudUpload,
  Edit,
  Person,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddTransactionDialog from '../components/AddTransactionDialog';
import { usePlaidLink } from 'react-plaid-link';
import AISuggestionsPanel from '../components/AISuggestionsPanel';

// Clean, Simple.com inspired styling
const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 212, 170, 0.2)',
  marginBottom: theme.spacing(3),
}));

const DailyAmount = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: '1px solid #e6ebf1',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));


const BalanceChip = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: '8px 16px',
  borderRadius: 20,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

interface DashboardData {
  dailyAllowance: number;
  totalBalance: number;
  accountsCount: number;
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    isIncome: boolean;
  }>;
  thisMonthSpent: number;
  thisMonthIncome: number;
}

const SimpleDashboard: React.FC = () => {
  console.log('SimpleDashboard component rendered');
  
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addTransactionDialog, setAddTransactionDialog] = useState<{
    open: boolean;
    type: 'income' | 'expense';
  }>({ open: false, type: 'expense' });
  const [balanceEditDialog, setBalanceEditDialog] = useState({
    open: false,
    amount: '',
  });
  const [success, setSuccess] = useState('');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  
  console.log('SimpleDashboard state:', { user: !!user, isAdmin, loading, error, dashboardData: !!dashboardData });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('loadDashboardData called');
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('money_clip_token');
      console.log('Token found:', !!token);
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      // Get API base URL
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      console.log('Using API URL:', apiBaseUrl);
      
      // Fetch daily allowance and summary data
      const [allowanceResponse, summaryResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/daily-allowance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${apiBaseUrl}/api/transactions/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!allowanceResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const allowanceData = await allowanceResponse.json();
      const summaryData = await summaryResponse.json();

      setDashboardData({
        dailyAllowance: allowanceData.daily_allowance || 0,
        totalBalance: allowanceData.breakdown?.total_balance || 0,
        accountsCount: allowanceData.accounts?.length || 0,
        recentTransactions: summaryData.recent_transactions?.map((t: any) => ({
          id: t.id.toString(),
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
          isIncome: t.is_income,
        })) || [],
        thisMonthSpent: summaryData.month_expenses || 0,
        thisMonthIncome: summaryData.month_income || 0,
      });
      
      setError('');
    } catch (err: any) {
      console.error('Dashboard data loading error:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getUserInitials = () => {
    const firstName = user?.first_name || '';
    const email = user?.email || '';
    
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };

  const handleQuickAdd = (type: 'income' | 'expense') => {
    setAddTransactionDialog({ open: true, type });
  };

  const handleImport = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      // Check if Plaid is available
      const statusResponse = await fetch(`${apiBaseUrl}/api/plaid/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (status.available) {
          // Create link token and launch Plaid Link (or demo mode)
          await initiatePlaidConnection(apiBaseUrl, token);
        } else {
          // This shouldn't happen anymore, but just in case
          setError('Import feature unavailable. Please try again later.');
        }
      } else {
        setError('Import feature unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to connect to bank. Please try again later.');
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/plaid/exchange-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          metadata: metadata,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`✅ Successfully connected ${result.accounts_synced || 0} accounts!`);
        setTimeout(() => setSuccess(''), 5000);
        // Refresh dashboard data to show new accounts
        await loadDashboardData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect accounts');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      setError('Failed to connect accounts. Please try again.');
    }
  };

  const handlePlaidError = (error: any) => {
    console.error('Plaid Link error:', error);
    setError(`Bank connection error: ${error.error_message || 'Unknown error'}`);
  };

  const handlePlaidExit = (error: any, metadata: any) => {
    if (error != null) {
      console.error('Plaid Link exit with error:', error);
    } else {
      console.log('Plaid Link exited normally:', metadata);
    }
  };

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onError: handlePlaidError,
    onExit: handlePlaidExit,
  };

  const { open, ready } = usePlaidLink(config);

  const initiatePlaidConnection = async (apiBaseUrl: string, token: string) => {
    try {
      // Get link token from backend
      const linkResponse = await fetch(`${apiBaseUrl}/api/plaid/link-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          user_name: user?.first_name || 'User',
        }),
      });

      if (!linkResponse.ok) {
        throw new Error('Failed to create link token');
      }

      const linkData = await linkResponse.json();
      
      if (linkData.link_token) {
        if (linkData.demo_mode) {
          // Demo mode - show informative message about real setup
          setSuccess('🔧 Demo Mode: This would connect to your real bank with Plaid credentials. Check setup-plaid.md for 5-minute setup instructions!');
          setTimeout(() => setSuccess(''), 8000);
          console.log('Demo Link Token:', linkData.link_token);
          console.log('📋 To enable real bank connections, see: setup-plaid.md');
        } else {
          // Production mode - set link token and open Plaid Link
          setLinkToken(linkData.link_token);
          // Link will open once token is set and ready
        }
      } else {
        throw new Error('No link token received');
      }
    } catch (error) {
      console.error('Plaid connection error:', error);
      setError('Failed to initialize bank connection. Please try again.');
    }
  };

  // Auto-open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const handleAddTransaction = async (transactionData: any) => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add ${transactionData.is_income ? 'income' : 'expense'}`);
      }

      // Refresh dashboard data
      await loadDashboardData();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add transaction');
    }
  };

  const handleBalanceEdit = () => {
    if (dashboardData) {
      setBalanceEditDialog({
        open: true,
        amount: dashboardData.totalBalance.toString(),
      });
    }
  };

  const handleBalanceUpdate = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/accounts/balance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_balance: parseFloat(balanceEditDialog.amount)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update balance');
      }

      setBalanceEditDialog({ open: false, amount: '' });
      await loadDashboardData(); // Refresh data
    } catch (err: any) {
      console.error('Failed to update balance:', err);
      setError(err.message || 'Failed to update balance');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={40} />
            <Typography variant="h6" color="text.secondary">
              Loading your financial data...
            </Typography>
          </Stack>
        </Box>
      </DashboardContainer>
    );
  }

  if (error || !dashboardData) {
    return (
      <DashboardContainer>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Failed to load dashboard'}
          <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer maxWidth="md">
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

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="#00d4aa">
          Clip
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {isAdmin && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => window.location.href = '/admin'}
              sx={{ color: '#00d4aa', borderColor: '#00d4aa' }}
            >
              Admin
            </Button>
          )}
          <Button 
            variant="text" 
            size="small"
            onClick={() => navigate('/help')}
            sx={{ color: '#666' }}
          >
            Help
          </Button>
          <IconButton 
            onClick={() => navigate('/profile')}
            sx={{ 
              p: 0.5,
              '&:hover': { backgroundColor: 'rgba(0, 212, 170, 0.1)' } 
            }}
          >
            <Avatar
              sx={{ 
                width: 36, 
                height: 36, 
                backgroundColor: '#00d4aa',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
          <Button onClick={logout} size="small" sx={{ color: '#666' }}>
            Logout
          </Button>
        </Stack>
      </Box>

      {/* Daily Allowance Hero */}
      <HeroCard>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              Available Today
            </Typography>
            <DailyAmount>
              {formatCurrency(dashboardData.dailyAllowance)}
            </DailyAmount>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              Based on your current balance and upcoming expenses
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <BalanceChip onClick={handleBalanceEdit}>
                <AccountBalance sx={{ fontSize: '1rem' }} />
                <Typography variant="body2">
                  {formatCurrency(dashboardData.totalBalance)} total
                </Typography>
                <Edit sx={{ fontSize: '0.875rem', opacity: 0.8 }} />
              </BalanceChip>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {dashboardData.accountsCount} accounts
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </HeroCard>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <QuickActionCard onClick={() => handleQuickAdd('income')}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUp sx={{ fontSize: '2rem', color: '#00d4aa', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Add Income
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
        <Grid item xs={4}>
          <QuickActionCard onClick={() => handleQuickAdd('expense')}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Receipt sx={{ fontSize: '2rem', color: '#6b7280', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Add Expense
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
        <Grid item xs={4}>
          <QuickActionCard onClick={handleImport}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CloudUpload sx={{ fontSize: '2rem', color: '#00d4aa', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Import Data
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
      </Grid>

      {/* AI Suggestions Panel */}
      <AISuggestionsPanel onSuggestionApproved={loadDashboardData} />

      {/* This Month Summary */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            This Month
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700} color="#00d4aa">
                  {formatCurrency(dashboardData.thisMonthIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Income
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700} color="#ef4444">
                  {formatCurrency(dashboardData.thisMonthSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Spent
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Recent Transactions
            </Typography>
            <Button size="small" color="primary">
              View All
            </Button>
          </Box>
          
          <Stack spacing={1}>
            {dashboardData.recentTransactions.map((transaction, index) => (
              <Box key={transaction.id}>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {transaction.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.category} • {formatDate(transaction.date)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    color={transaction.isIncome ? '#10b981' : '#ef4444'}
                  >
                    {transaction.isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </Typography>
                </Box>
                {index < dashboardData.recentTransactions.length - 1 && <Divider />}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#00d4aa',
          '&:hover': {
            backgroundColor: '#00b894',
          },
        }}
        onClick={() => handleQuickAdd('expense')}
      >
        <Add />
      </Fab>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={addTransactionDialog.open}
        type={addTransactionDialog.type}
        onClose={() => setAddTransactionDialog({ open: false, type: 'expense' })}
        onSubmit={handleAddTransaction}
      />

      {/* Balance Edit Dialog */}
      <Dialog open={balanceEditDialog.open} onClose={() => setBalanceEditDialog({ open: false, amount: '' })}>
        <DialogTitle>Edit Total Balance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update your current total balance across all accounts.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Total Balance"
            type="number"
            fullWidth
            variant="outlined"
            value={balanceEditDialog.amount}
            onChange={(e) => setBalanceEditDialog({ ...balanceEditDialog, amount: e.target.value })}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceEditDialog({ open: false, amount: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={handleBalanceUpdate} 
            variant="contained"
            sx={{ backgroundColor: '#00d4aa', '&:hover': { backgroundColor: '#00b894' } }}
          >
            Update Balance
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default SimpleDashboard;