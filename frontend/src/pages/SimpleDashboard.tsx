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
} from '@mui/material';
import {
  Add,
  AccountBalance,
  TrendingUp,
  Receipt,
  CloudUpload,
  Edit,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import AddTransactionDialog from '../components/AddTransactionDialog';

// Clean, Simple.com inspired styling
const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(99, 91, 255, 0.2)',
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addTransactionDialog, setAddTransactionDialog] = useState<{
    open: boolean;
    type: 'income' | 'expense';
  }>({ open: false, type: 'expense' });
  
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

  const handleQuickAdd = (type: 'income' | 'expense') => {
    setAddTransactionDialog({ open: true, type });
  };

  const handleImport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/plaid/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        if (status.available) {
          // TODO: Implement Plaid Link integration
          alert('Plaid integration is available! Bank connection feature coming soon.');
        } else {
          alert('Import feature is in development. Manual CSV import coming soon!');
        }
      } else {
        alert('Import feature coming soon!');
      }
    } catch (error) {
      alert('Import feature coming soon!');
    }
  };

  const handleAddTransaction = async (transactionData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/transactions', {
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="#0a2540">
          Money Clip
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {isAdmin && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => window.location.href = '/admin'}
              sx={{ color: '#635bff', borderColor: '#635bff' }}
            >
              Admin
            </Button>
          )}
          <Typography variant="body2" color="text.secondary">
            Hi, {user?.first_name}
          </Typography>
          <Button onClick={logout} size="small">
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
              <BalanceChip>
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
              <TrendingUp sx={{ fontSize: '2rem', color: '#10b981', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Add Income
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
        <Grid item xs={4}>
          <QuickActionCard onClick={() => handleQuickAdd('expense')}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Receipt sx={{ fontSize: '2rem', color: '#f59e0b', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Add Expense
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
        <Grid item xs={4}>
          <QuickActionCard onClick={handleImport}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CloudUpload sx={{ fontSize: '2rem', color: '#635bff', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Import Data
              </Typography>
            </CardContent>
          </QuickActionCard>
        </Grid>
      </Grid>

      {/* This Month Summary */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            This Month
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700} color="#10b981">
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
          backgroundColor: '#635bff',
          '&:hover': {
            backgroundColor: '#5b4ff0',
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
    </DashboardContainer>
  );
};

export default SimpleDashboard;