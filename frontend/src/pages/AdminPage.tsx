import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Grid,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Add, PersonAdd, Delete, Edit } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: '#f8fafc',
}));

const Header = styled(Box)(() => ({
  background: 'white',
  borderBottom: '1px solid #e6ebf1',
  padding: '1rem 2rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
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

const StatsGrid = styled(Grid)(() => ({
  marginBottom: '2rem',
}));

const StatCard = styled(Card)(() => ({
  background: 'white',
  border: '1px solid #e6ebf1',
  textAlign: 'center',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const StatNumber = styled(Typography)(() => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#635bff',
  marginBottom: '0.5rem',
}));

const StatLabel = styled(Typography)(() => ({
  color: '#666',
  fontSize: '0.9rem',
}));

const TableCard = styled(Card)(() => ({
  background: 'white',
  border: '1px solid #e6ebf1',
}));

const ActionButton = styled(Button)(() => ({
  marginRight: '0.5rem',
  textTransform: 'none',
  borderRadius: '4px',
}));

interface WaitlistUser {
  id: number;
  email: string;
  name: string;
  status: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  source?: string;
}

interface AdminStats {
  totalSignups: number;
  pendingCount: number;
  approvedCount: number;
  recentSignups: number;
}

interface SignupToken {
  email: string;
  token: string;
  status: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  signup_url?: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [waitlistData, setWaitlistData] = useState<WaitlistUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalSignups: 0,
    pendingCount: 0,
    approvedCount: 0,
    recentSignups: 0
  });
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);
  const [signupTokens, setSignupTokens] = useState<SignupToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approveDialog, setApproveDialog] = useState<{open: boolean, user?: WaitlistUser}>({open: false});
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({email: '', name: ''});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, user?: WaitlistUser}>({open: false});

  useEffect(() => {
    loadWaitlistData();
    loadSignupTokens();
    const interval = setInterval(() => {
      loadWaitlistData();
      loadSignupTokens();
    }, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWaitlistData = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/waitlist/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load waitlist data');
      }

      setWaitlistData(data.users || []);
      
      // Calculate stats
      const users = data.users || [];
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setStats({
        totalSignups: users.length,
        pendingCount: users.filter((u: WaitlistUser) => u.status === 'pending').length,
        approvedCount: users.filter((u: WaitlistUser) => u.status === 'approved').length,
        recentSignups: users.filter((u: WaitlistUser) => 
          new Date(u.created_at) > yesterday
        ).length
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadSignupTokens = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/tokens/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load signup tokens');
      }

      setSignupTokens(data.tokens || []);
    } catch (err: any) {
      console.error('Error loading signup tokens:', err);
      // Don't show error for tokens - it's not critical
    }
  };

  const handleApprove = async (user: WaitlistUser) => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/waitlist/approve/${user.email}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve user');
      }

      setApproveDialog({open: false});
      loadWaitlistData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (email: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/waitlist/status/${email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      loadWaitlistData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/waitlist/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add user');
      }

      setAddUserDialog(false);
      setNewUser({email: '', name: ''});
      loadWaitlistData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (user: WaitlistUser) => {
    try {
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/admin/waitlist/delete/${user.email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      setDeleteDialog({open: false});
      loadWaitlistData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'signed_up': return 'info';
      default: return 'warning';
    }
  };

  const filteredData = currentFilter === 'all' 
    ? waitlistData 
    : waitlistData.filter(user => user.status === currentFilter);

  return (
    <AdminContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>Clip Admin</Logo>
          <Box>
            <Button onClick={() => {
              console.log('My Dashboard clicked - navigating to /dashboard');
              try {
                navigate('/dashboard');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }} sx={{ mr: 2 }}>
              📊 My Dashboard
            </Button>
            <Button onClick={() => navigate('/')} sx={{ mr: 2 }}>
              ← Back to Site
            </Button>
            <Button onClick={logout} variant="outlined">
              Logout
            </Button>
          </Box>
        </HeaderContent>
      </Header>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Grid */}
        <StatsGrid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <StatNumber>{stats.totalSignups}</StatNumber>
                <StatLabel>Total Signups</StatLabel>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <StatNumber>{stats.pendingCount}</StatNumber>
                <StatLabel>Pending Approval</StatLabel>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <StatNumber>{stats.approvedCount}</StatNumber>
                <StatLabel>Approved</StatLabel>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <StatNumber>{stats.recentSignups}</StatNumber>
                <StatLabel>Last 24h</StatLabel>
              </CardContent>
            </StatCard>
          </Grid>
        </StatsGrid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Admin Tabs */}
        <TableCard>
          <Box sx={{ borderBottom: '1px solid #e6ebf1' }}>
            <Tabs 
              value={currentTab} 
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ px: 2, pt: 2 }}
            >
              <Tab label="Waitlist Management" />
              <Tab label="Signup Tokens" />
            </Tabs>
          </Box>

          {currentTab === 0 && (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e6ebf1' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h3">
                    Manage Waitlist Users
                  </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  onClick={() => setAddUserDialog(true)} 
                  variant="contained" 
                  size="small"
                  startIcon={<PersonAdd />}
                  sx={{ backgroundColor: '#00d4aa', '&:hover': { backgroundColor: '#00b894' } }}
                >
                  Add User
                </Button>
                <Button onClick={loadWaitlistData} variant="outlined" size="small">
                  Refresh
                </Button>
              </Box>
                </Box>
                
                <Tabs 
                  value={currentFilter} 
                  onChange={(_, newValue) => setCurrentFilter(newValue)}
                  sx={{ mt: 2 }}
                >
                  <Tab label="All" value="all" />
                  <Tab label="Pending" value="pending" />
                  <Tab label="Approved" value="approved" />
                  <Tab label="Signed Up" value="signed_up" />
                </Tabs>
              </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No {currentFilter === 'all' ? '' : currentFilter} users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back later or try a different filter.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Signed Up</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || 'Unknown'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || 'pending'} 
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.source || 'unknown'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {user.status !== 'approved' && (
                            <ActionButton
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => setApproveDialog({open: true, user})}
                            >
                              Approve
                            </ActionButton>
                          )}
                          {user.status === 'pending' && (
                            <ActionButton
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleStatusChange(user.email, 'rejected')}
                            >
                              Reject
                            </ActionButton>
                          )}
                          {user.status === 'approved' && (
                            <ActionButton
                              variant="outlined"
                              color="warning"
                              size="small"
                              onClick={() => handleStatusChange(user.email, 'pending')}
                            >
                              Reset
                            </ActionButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({open: true, user})}
                            title="Delete user"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
            </>
          )}

          {currentTab === 1 && (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e6ebf1' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h3">
                    Signup Tokens
                  </Typography>
                  <Button onClick={loadSignupTokens} variant="outlined" size="small">
                    Refresh
                  </Button>
                </Box>
              </Box>

              {signupTokens.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No signup tokens found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tokens are created when users are approved.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Used</TableCell>
                        <TableCell>Signup URL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {signupTokens.map((token) => (
                        <TableRow key={token.token}>
                          <TableCell>{token.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={token.status} 
                              color={token.status === 'active' ? 'success' : token.status === 'used' ? 'info' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(token.created_at)}</TableCell>
                          <TableCell>{formatDate(token.expires_at)}</TableCell>
                          <TableCell>{token.used_at ? formatDate(token.used_at) : '-'}</TableCell>
                          <TableCell>
                            {token.signup_url ? (
                              <Button 
                                size="small" 
                                onClick={() => navigator.clipboard.writeText(token.signup_url!)}
                                variant="outlined"
                              >
                                Copy Link
                              </Button>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </TableCard>
      </Container>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({open: false})}>
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          <Typography>
            Approve {approveDialog.user?.name} ({approveDialog.user?.email}) for Clip access?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            They will receive a welcome email with signup instructions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({open: false})}>Cancel</Button>
          <Button 
            onClick={() => approveDialog.user && handleApprove(approveDialog.user)}
            variant="contained" 
            color="success"
          >
            Approve & Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Waitlist User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser}
            variant="contained"
            disabled={!newUser.email || !newUser.name}
            sx={{ backgroundColor: '#00d4aa', '&:hover': { backgroundColor: '#00b894' } }}
          >
            Add to Waitlist
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({open: false})}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.user?.name} ({deleteDialog.user?.email})?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({open: false})}>Cancel</Button>
          <Button 
            onClick={() => deleteDialog.user && handleDeleteUser(deleteDialog.user)}
            variant="contained" 
            color="error"
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </AdminContainer>
  );
};

export default AdminPage;