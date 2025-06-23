import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Stack,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Security,
  Help,
  PhotoCamera,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const AvatarUpload = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  '&:hover .upload-overlay': {
    opacity: 1,
  },
}));

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  cursor: 'pointer',
}));

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  profile_picture: string;
  identity_documents: Array<{
    type: string;
    front_image: string;
    back_image?: string;
  }>;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    first_name: user?.first_name || '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    profile_picture: '',
    identity_documents: [],
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [supportDialog, setSupportDialog] = useState(false);
  const [supportRequest, setSupportRequest] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          ...data.user,
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('money_clip_token');
      const apiBaseUrl = window.location.hostname === 'app.moneyclip.money' 
        ? 'https://clip-mvp-production.up.railway.app'
        : process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSupportRequest = async () => {
    try {
      setLoading(true);
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
          user_name: profile.first_name,
        }),
      });

      if (response.ok) {
        setSuccess('Support request submitted successfully!');
        setSupportDialog(false);
        setSupportRequest({ subject: '', message: '', priority: 'medium' });
        setTimeout(() => setSuccess(''), 3000);
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

  const getInitials = () => {
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <ProfileContainer maxWidth="md">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="#00d4aa">
          Profile
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button onClick={() => navigate('/dashboard')} variant="outlined">
            Back to Dashboard
          </Button>
          <Button onClick={logout} color="inherit">
            Logout
          </Button>
        </Stack>
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

      {/* Profile Picture & Basic Info */}
      <ProfileCard>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <AvatarUpload>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  backgroundColor: '#00d4aa',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
                src={profile.profile_picture}
              >
                {getInitials()}
              </Avatar>
              <UploadOverlay className="upload-overlay">
                <PhotoCamera sx={{ color: 'white' }} />
              </UploadOverlay>
            </AvatarUpload>
            
            <Box flex={1}>
              <Typography variant="h5" fontWeight={600} mb={1}>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                {profile.email}
              </Typography>
              <Button
                variant={editing ? "outlined" : "contained"}
                startIcon={editing ? <Cancel /> : <Edit />}
                onClick={() => {
                  if (editing) {
                    setEditing(false);
                  } else {
                    setEditing(true);
                  }
                }}
                sx={{
                  backgroundColor: editing ? 'transparent' : '#00d4aa',
                  '&:hover': {
                    backgroundColor: editing ? 'rgba(0, 212, 170, 0.1)' : '#00b894',
                  },
                }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
              {editing && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ 
                    ml: 2,
                    backgroundColor: '#00d4aa',
                    '&:hover': { backgroundColor: '#00b894' },
                  }}
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </ProfileCard>

      {/* Personal Information */}
      <ProfileCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            Personal Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={profile.email}
                disabled={true}
                variant="filled"
                helperText="Email cannot be changed. Contact support if needed."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
                placeholder="+1 (555) 123-4567"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address (Optional)"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
                multiline
                rows={2}
                placeholder="123 Main St, City, State 12345"
              />
            </Grid>
          </Grid>
        </CardContent>
      </ProfileCard>

      {/* Security & Support */}
      <ProfileCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <Security color="primary" />
            Security & Support
          </Typography>
          
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setPasswordDialog(true)}
              sx={{ 
                justifyContent: 'flex-start',
                p: 2,
                borderColor: '#e0e0e0',
                '&:hover': { borderColor: '#00d4aa' },
              }}
            >
              <Security sx={{ mr: 2 }} />
              Change Password
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setSupportDialog(true)}
              sx={{ 
                justifyContent: 'flex-start',
                p: 2,
                borderColor: '#e0e0e0',
                '&:hover': { borderColor: '#00d4aa' },
              }}
            >
              <Help sx={{ mr: 2 }} />
              Contact Support
            </Button>
          </Stack>
        </CardContent>
      </ProfileCard>

      {/* Support Dialog */}
      <Dialog 
        open={supportDialog} 
        onClose={() => setSupportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Have a question or need help? Send us a message and we'll get back to you soon.
          </Typography>
          
          <TextField
            fullWidth
            label="Subject"
            value={supportRequest.subject}
            onChange={(e) => setSupportRequest({ ...supportRequest, subject: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Message"
            value={supportRequest.message}
            onChange={(e) => setSupportRequest({ ...supportRequest, message: e.target.value })}
            multiline
            rows={4}
            placeholder="Describe your issue or question in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSupportRequest}
            variant="contained"
            disabled={!supportRequest.subject || !supportRequest.message || loading}
            sx={{
              backgroundColor: '#00d4aa',
              '&:hover': { backgroundColor: '#00b894' },
            }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Password management coming soon! For now, please contact support to change your password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ProfileContainer>
  );
};

export default ProfilePage;