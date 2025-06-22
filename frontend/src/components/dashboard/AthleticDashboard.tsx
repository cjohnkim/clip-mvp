import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  Add,
  TrendingUp,
  EmojiEvents,
  Whatshot,
  Timeline,
  Analytics,
  Share,
  Refresh,
  Info,
  SportsMma,
  Speed
} from '@mui/icons-material';

// Import our athletic components
import PerformanceScore from '../athletic/PerformanceScore';
import StreakCounter from '../athletic/StreakCounter';
import AchievementBadge from '../athletic/AchievementBadge';
import ProgressBar from '../athletic/ProgressBar';

// Import theme
import { athleticTheme, athleticColors, getPerformanceStyle } from '../../theme/athleticTheme';
import { ThemeProvider } from '@mui/material/styles';

// Import services
import { calculationService } from '../../services/calculationService';

// Celebration animation
const celebration = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
  100% { transform: translateY(-100vh) rotateZ(720deg); opacity: 0; }
`;

// Styled components
const DashboardContainer = styled(Container)({
  background: athleticColors.backgrounds.app,
  minHeight: '100vh',
  paddingTop: '2rem',
  paddingBottom: '2rem',
});

const HeroBanner = styled(Card)<{ performance?: string }>(({ performance = 'neutral' }) => {
  const style = getPerformanceStyle(performance as any);
  return {
    background: style.background,
    color: 'white',
    borderRadius: '24px',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
    transform: style.transform,
    boxShadow: style.shadow,
    transition: 'all 0.3s ease',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
  };
});

const StatCard = styled(Card)<{ glowing?: boolean }>(({ glowing }) => ({
  borderRadius: '16px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 20px rgba(0, 212, 170, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  
  ...(glowing && {
    animation: `${celebration} 2s ease-in-out infinite`,
    boxShadow: '0 8px 30px rgba(255, 215, 0, 0.3)',
  }),
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 212, 170, 0.15)',
  },
}));

const FloatingActionButton = styled(Fab)({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  background: athleticColors.backgrounds.hero,
  boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)',
  '&:hover': {
    background: athleticColors.backgrounds.hero,
    transform: 'scale(1.1)',
    boxShadow: '0 12px 35px rgba(0, 212, 170, 0.4)',
  },
});

const AchievementGrid = styled(Box)({
  display: 'flex',
  gap: '1rem',
  overflowX: 'auto',
  padding: '1rem 0',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f5f9',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: athleticColors.primary,
    borderRadius: '4px',
  },
});

const QuickStatChip = styled(Chip)<{ chipvariant: 'positive' | 'neutral' | 'negative' }>(({ chipvariant }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  backgroundColor: chipvariant === 'positive' ? 'rgba(16, 185, 129, 0.2)'
                  : chipvariant === 'negative' ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
  color: chipvariant === 'positive' ? '#059669'
        : chipvariant === 'negative' ? '#dc2626'
        : '#6b7280',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

interface DashboardData {
  performance: {
    score: number;
    category: string;
    spent_today: number;
    target_today: number;
    saved_today: number;
  };
  streak: {
    current_streak: number;
    longest_streak: number;
    total_days: number;
    is_active: boolean;
    last_active: string | null;
    streak_start: string | null;
  };
  level: {
    current_level: number;
    total_xp: number;
    current_level_xp: number;
    xp_to_next_level: number;
    achievements_unlocked: number;
    total_days_trained: number;
    total_saved: number;
  };
  analytics: {
    total_saved_period: number;
    average_score: number;
    week_average: number;
    personal_best: number;
    trend_direction: string;
    days_tracked: number;
  };
  recent_performances: Array<{
    date: string;
    score: number;
    category: string;
    saved: number;
    streak_day?: number;
  }>;
  achievements: {
    recent_unlocked: Array<any>;
    progress_achievements: Array<any>;
    total_unlocked: number;
    total_points: number;
  };
}

const AthleticDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [todayTarget, setTodayTarget] = useState('');
  const [todaySpent, setTodaySpent] = useState('');
  const [recordingPerformance, setRecordingPerformance] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual athletic API call
      const response = await calculationService.getDailyClip();
      
      // Mock athletic dashboard data for now
      const mockData: DashboardData = {
        performance: {
          score: 85,
          category: 'excellent',
          spent_today: 32.50,
          target_today: 47.32,
          saved_today: 14.82
        },
        streak: {
          current_streak: 12,
          longest_streak: 28,
          total_days: 45,
          is_active: true,
          last_active: new Date().toISOString().split('T')[0],
          streak_start: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        level: {
          current_level: 5,
          total_xp: 2840,
          current_level_xp: 340,
          xp_to_next_level: 660,
          achievements_unlocked: 8,
          total_days_trained: 45,
          total_saved: 1247.50
        },
        analytics: {
          total_saved_period: 623.40,
          average_score: 78.5,
          week_average: 82.1,
          personal_best: 98,
          trend_direction: 'improving',
          days_tracked: 30
        },
        recent_performances: [
          { date: '2025-01-19', score: 85, category: 'excellent', saved: 14.82, streak_day: 12 },
          { date: '2025-01-18', score: 78, category: 'good', saved: 8.20, streak_day: 11 },
          { date: '2025-01-17', score: 92, category: 'excellent', saved: 22.10, streak_day: 10 },
          { date: '2025-01-16', score: 74, category: 'good', saved: 5.40, streak_day: 9 },
          { date: '2025-01-15', score: 88, category: 'excellent', saved: 18.30, streak_day: 8 },
        ],
        achievements: {
          recent_unlocked: [
            { id: 1, title: 'Week Warrior', icon: '🔥', tier: 'silver', unlocked_at: '2025-01-18' },
            { id: 2, title: 'First $100', icon: '💵', tier: 'bronze', unlocked_at: '2025-01-15' },
          ],
          progress_achievements: [
            { id: 3, title: 'Monthly Master', icon: '👑', tier: 'gold', progress: 40, requirement: '30-day streak' },
            { id: 4, title: 'Emergency Buffer', icon: '🛡️', tier: 'silver', progress: 78, requirement: 'Save $500' },
          ],
          total_unlocked: 8,
          total_points: 1650
        }
      };
      
      setDashboardData(mockData);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRecordPerformance = async () => {
    if (!todayTarget || !todaySpent) {
      setError('Please enter both target and spent amounts');
      return;
    }

    try {
      setRecordingPerformance(true);
      
      const target = parseFloat(todayTarget);
      const spent = parseFloat(todaySpent);
      
      if (target < 0 || spent < 0) {
        setError('Amounts must be non-negative');
        return;
      }

      // TODO: Call athletic API to record performance
      // const result = await athleticService.recordPerformance(target, spent);
      
      // Mock celebration for demo
      const saved = target - spent;
      const score = Math.max(0, Math.min(100, 100 - (spent / target) * 50));
      
      if (score >= 80) {
        setCelebrationData({
          type: 'excellent',
          message: `Outstanding! +$${saved.toFixed(0)} banked! 🏆`,
          newAchievement: score >= 95 ? { title: 'Perfect Day', icon: '⭐' } : null
        });
      }
      
      setSnackbarMessage('Performance recorded successfully! 🎉');
      setSnackbarOpen(true);
      setRecordDialogOpen(false);
      setTodayTarget('');
      setTodaySpent('');
      
      // Refresh dashboard
      await loadDashboardData();
      
    } catch (err: any) {
      setError('Failed to record performance');
    } finally {
      setRecordingPerformance(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <ThemeProvider theme={athleticTheme}>
        <DashboardContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <SportsMma sx={{ fontSize: '4rem', color: athleticColors.primary, mb: 2 }} />
              <Typography variant="h5" color="primary" fontWeight={600}>
                Loading your training data...
              </Typography>
            </Box>
          </Box>
        </DashboardContainer>
      </ThemeProvider>
    );
  }

  if (error && !dashboardData) {
    return (
      <ThemeProvider theme={athleticTheme}>
        <DashboardContainer>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        </DashboardContainer>
      </ThemeProvider>
    );
  }

  if (!dashboardData) return null;

  return (
    <ThemeProvider theme={athleticTheme}>
      <DashboardContainer maxWidth="lg">
        {/* Header with Admin Link */}
        {isAdmin && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(0, 212, 170, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 170, 0.3)'
            }}
          >
            <Typography variant="h6" sx={{ color: '#00d4aa', fontWeight: 600 }}>
              👋 Welcome back, {user?.first_name || 'Admin'}!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/admin')}
                sx={{ 
                  borderColor: '#00d4aa',
                  color: '#00d4aa',
                  '&:hover': {
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)'
                  }
                }}
              >
                🛡️ Admin Panel
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={logout}
                sx={{ 
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#333',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Hero Performance Banner */}
        <HeroBanner performance={dashboardData.performance.category}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  Today's Training Session
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Level {dashboardData.level.current_level} Financial Athlete
                </Typography>
              </Box>
              <Avatar sx={{ 
                width: 64, 
                height: 64, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem'
              }}>
                🏃‍♂️
              </Avatar>
            </Box>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <PerformanceScore
                  performanceData={{
                    score: dashboardData.performance.score,
                    spentToday: dashboardData.performance.spent_today,
                    targetToday: dashboardData.performance.target_today,
                    savedAmount: dashboardData.performance.saved_today,
                    streakImpact: dashboardData.streak.is_active,
                    weekAverage: dashboardData.analytics.week_average,
                    monthAverage: dashboardData.analytics.average_score,
                    personalBest: dashboardData.analytics.personal_best,
                    category: dashboardData.performance.category as any
                  }}
                  size="large"
                  showDetails={false}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <StreakCounter
                  streakData={{
                    currentStreak: dashboardData.streak.current_streak,
                    longestStreak: dashboardData.streak.longest_streak,
                    totalDays: dashboardData.streak.total_days,
                    isActive: dashboardData.streak.is_active,
                    lastActiveDate: dashboardData.streak.last_active ? new Date(dashboardData.streak.last_active) : null,
                    streakStartDate: dashboardData.streak.streak_start ? new Date(dashboardData.streak.streak_start) : null
                  }}
                  size="large"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                    {formatCurrency(dashboardData.performance.saved_today)}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                    Banked Today
                  </Typography>
                  
                  <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                    <QuickStatChip
                      chipvariant={dashboardData.analytics.trend_direction === 'improving' ? 'positive' : 'neutral'}
                      icon={<TrendingUp />}
                      label={`${dashboardData.analytics.trend_direction} trend`}
                      size="small"
                    />
                    <QuickStatChip
                      chipvariant="positive"
                      icon={<EmojiEvents />}
                      label={`${dashboardData.achievements.total_unlocked} badges`}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </HeroBanner>

        {/* Quick Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <StatCard>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Speed sx={{ fontSize: '2rem', color: athleticColors.primary, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="primary">
                  {dashboardData.analytics.week_average}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Week Average
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <StatCard>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Whatshot sx={{ fontSize: '2rem', color: athleticColors.streak[7], mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: athleticColors.streak[7] }}>
                  {dashboardData.streak.current_streak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Streak
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <StatCard>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <EmojiEvents sx={{ fontSize: '2rem', color: athleticColors.gold, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} sx={{ color: athleticColors.gold }}>
                  {dashboardData.level.current_level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Athlete Level
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <StatCard>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUp sx={{ fontSize: '2rem', color: athleticColors.victory, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="primary">
                  {formatCurrency(dashboardData.level.total_saved)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Saved
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Progress Bars Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ProgressBar
              data={{
                current: dashboardData.level.current_level_xp,
                target: dashboardData.level.xp_to_next_level,
                label: 'Level Progress',
                sublabel: `Level ${dashboardData.level.current_level} → ${dashboardData.level.current_level + 1}`,
                category: 'goal'
              }}
              variant="hero"
              height={16}
              showStatus={true}
              animated={true}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ProgressBar
              data={{
                current: 390,
                target: 500,
                label: 'Emergency Fund',
                sublabel: 'Building financial security',
                category: 'emergency',
                milestones: [
                  { value: 100, label: '$100', achieved: true },
                  { value: 250, label: '$250', achieved: true },
                  { value: 500, label: '$500', achieved: false }
                ]
              }}
              variant="hero"
              height={16}
              showMilestones={true}
              animated={true}
            />
          </Grid>
        </Grid>

        {/* Achievements Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight={600}>
                Achievement Gallery
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<EmojiEvents />}
                onClick={() => navigate('/achievements')}
              >
                View All
              </Button>
            </Box>
            
            <AchievementGrid>
              {dashboardData.achievements.recent_unlocked.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={{
                    ...achievement,
                    unlocked: true,
                    requirement: '',
                    category: 'milestone'
                  }}
                  size="large"
                  showLabel={true}
                />
              ))}
              
              {dashboardData.achievements.progress_achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={{
                    ...achievement,
                    unlocked: false,
                    requirement: achievement.requirement,
                    category: 'milestone'
                  }}
                  size="large"
                  showLabel={true}
                  showProgress={true}
                />
              ))}
            </AchievementGrid>
          </CardContent>
        </Card>

        {/* Recent Performance Chart */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Performance History
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Analytics />}
                onClick={() => navigate('/timeline')}
              >
                Full Timeline
              </Button>
            </Box>
            
            <Box sx={{ height: 200, position: 'relative' }}>
              {/* Simple performance chart */}
              <svg width="100%" height="100%" viewBox="0 0 800 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 40}
                    x2="800"
                    y2={i * 40}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Performance line */}
                <polyline
                  fill="none"
                  stroke={athleticColors.primary}
                  strokeWidth="3"
                  points={dashboardData.recent_performances.map((perf, index) => {
                    const x = (index / (dashboardData.recent_performances.length - 1)) * 800;
                    const y = 180 - (perf.score / 100) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* Performance dots */}
                {dashboardData.recent_performances.map((perf, index) => {
                  const x = (index / (dashboardData.recent_performances.length - 1)) * 800;
                  const y = 180 - (perf.score / 100) * 160;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="6"
                      fill={perf.category === 'excellent' ? athleticColors.victory : 
                            perf.category === 'good' ? '#3b82f6' : '#6b7280'}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </Box>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <FloatingActionButton
          color="primary"
          aria-label="record performance"
          onClick={() => setRecordDialogOpen(true)}
        >
          <Add />
        </FloatingActionButton>

        {/* Record Performance Dialog */}
        <Dialog open={recordDialogOpen} onClose={() => setRecordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Today's Performance</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Daily Target ($)"
                type="number"
                value={todayTarget}
                onChange={(e) => setTodayTarget(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                fullWidth
                label="Amount Spent ($)"
                type="number"
                value={todaySpent}
                onChange={(e) => setTodaySpent(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecordDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleRecordPerformance}
              disabled={recordingPerformance}
            >
              {recordingPerformance ? 'Recording...' : 'Record Performance'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default AthleticDashboard;