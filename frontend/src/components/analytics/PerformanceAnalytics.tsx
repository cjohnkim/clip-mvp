import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  BarChart,
  Speed,
  EmojiEvents,
  LocalFireDepartment,
  SportsMma,
  Analytics as AnalyticsIcon,
  CalendarToday,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { athleticColors, getPerformanceStyle } from '../../theme/athleticTheme';

// Styled components
const AnalyticsContainer = styled(Container)({
  paddingTop: '2rem',
  paddingBottom: '2rem',
  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
  minHeight: '100vh',
});

const StatsCard = styled(Card)<{ performance?: string }>(({ performance = 'neutral' }) => {
  const isExcellent = performance === 'excellent';
  return {
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    boxShadow: isExcellent 
      ? '0 8px 30px rgba(16, 185, 129, 0.2)' 
      : '0 4px 20px rgba(0, 212, 170, 0.1)',
    transition: 'all 0.3s ease',
    background: isExcellent 
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 1) 100%)'
      : 'white',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isExcellent
        ? '0 12px 40px rgba(16, 185, 129, 0.25)'
        : '0 8px 30px rgba(0, 212, 170, 0.15)',
    },
  };
});

const MetricDisplay = styled(Box)<{ trend: 'up' | 'down' | 'neutral' }>(({ trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: trend === 'up' ? athleticColors.victory 
        : trend === 'down' ? '#ef4444' 
        : '#6b7280',
}));

const PerformanceRing = styled(Box)<{ score: number }>(({ score }) => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: `conic-gradient(
    ${score >= 80 ? athleticColors.victory : score >= 60 ? '#3b82f6' : '#f59e0b'} 0deg ${score * 3.6}deg,
    #f1f5f9 ${score * 3.6}deg 360deg
  )`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'white',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PerformanceAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data - replace with real API call
    const mockData = {
      overview: {
        currentScore: 85,
        averageScore: 78.5,
        trend: 'improving',
        streakDays: 12,
        totalSaved: 1247.50,
        bestWeek: 89.2,
        worstWeek: 65.8,
        consistency: 82, // How consistent performance is (0-100)
      },
      
      performanceHistory: [
        { date: '2025-01-13', score: 72, saved: 8.20, category: 'good' },
        { date: '2025-01-14', score: 85, saved: 15.40, category: 'excellent' },
        { date: '2025-01-15', score: 78, saved: 12.10, category: 'good' },
        { date: '2025-01-16', score: 92, saved: 22.30, category: 'excellent' },
        { date: '2025-01-17', score: 69, saved: 5.80, category: 'neutral' },
        { date: '2025-01-18', score: 88, saved: 18.70, category: 'excellent' },
        { date: '2025-01-19', score: 85, saved: 14.82, category: 'excellent' },
      ],
      
      weeklyBreakdown: [
        { week: 'Week 1', excellent: 3, good: 2, neutral: 1, poor: 1 },
        { week: 'Week 2', excellent: 4, good: 2, neutral: 1, poor: 0 },
        { week: 'Week 3', excellent: 5, good: 1, neutral: 1, poor: 0 },
        { week: 'Week 4', excellent: 4, good: 3, neutral: 0, poor: 0 },
      ],
      
      categoryBreakdown: [
        { category: 'Excellent', value: 45, color: athleticColors.victory },
        { category: 'Good', value: 30, color: '#3b82f6' },
        { category: 'Neutral', value: 20, color: '#6b7280' },
        { category: 'Poor', value: 5, color: '#f59e0b' },
      ],
      
      savingsPattern: [
        { month: 'Oct', saved: 245.30, target: 300 },
        { month: 'Nov', saved: 389.60, target: 350 },
        { month: 'Dec', saved: 412.80, target: 400 },
        { month: 'Jan', saved: 623.40, target: 450 },
      ],
      
      performanceRadar: [
        { metric: 'Consistency', value: 82, fullMark: 100 },
        { metric: 'Streak Length', value: 75, fullMark: 100 },
        { metric: 'Savings Rate', value: 88, fullMark: 100 },
        { metric: 'Goal Achievement', value: 92, fullMark: 100 },
        { metric: 'Trend Improvement', value: 85, fullMark: 100 },
        { metric: 'Challenge Completion', value: 70, fullMark: 100 },
      ],
      
      insights: [
        {
          type: 'positive',
          icon: '🔥',
          title: 'Hot Streak Active!',
          description: 'You\'re on a 12-day streak with 85% average performance. Keep the momentum!'
        },
        {
          type: 'opportunity',
          icon: '🎯',
          title: 'Weekend Opportunity',
          description: 'Your weekend performance averages 15% lower. Focus on Saturday/Sunday discipline.'
        },
        {
          type: 'achievement',
          icon: '🏆',
          title: 'Monthly Goal Exceeded',
          description: 'You\'ve saved 38% more than your monthly target. Outstanding work!'
        },
      ]
    };
    
    setAnalyticsData(mockData);
    setLoading(false);
  }, [timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: athleticColors.victory }} />;
      case 'declining': return <TrendingDown sx={{ color: '#ef4444' }} />;
      default: return <Timeline sx={{ color: '#6b7280' }} />;
    }
  };

  if (loading || !analyticsData) {
    return (
      <AnalyticsContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <AnalyticsIcon sx={{ fontSize: '4rem', color: athleticColors.primary, mb: 2 }} />
            <Typography variant="h5" color="primary" fontWeight={600}>
              Analyzing your performance...
            </Typography>
          </Box>
        </Box>
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: '#0a2540' }}>
          Performance Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Track your financial training like a professional athlete
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={(_, newTimeframe) => newTimeframe && setTimeframe(newTimeframe)}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="quarter">Quarter</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatsCard performance="excellent">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <PerformanceRing score={analyticsData.overview.currentScore}>
                <Box sx={{ zIndex: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {analyticsData.overview.currentScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current Score
                  </Typography>
                </Box>
              </PerformanceRing>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Speed sx={{ color: athleticColors.primary }} />
                <Typography variant="h6" fontWeight={600}>
                  Average Score
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                {analyticsData.overview.averageScore}
              </Typography>
              <MetricDisplay trend="up">
                {getTrendIcon(analyticsData.overview.trend)}
                <Typography variant="body2" fontWeight={600}>
                  {analyticsData.overview.trend}
                </Typography>
              </MetricDisplay>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocalFireDepartment sx={{ color: athleticColors.streak[7] }} />
                <Typography variant="h6" fontWeight={600}>
                  Streak Days
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{ color: athleticColors.streak[7], mb: 1 }}>
                {analyticsData.overview.streakDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current active streak
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StatsCard>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents sx={{ color: athleticColors.gold }} />
                <Typography variant="h6" fontWeight={600}>
                  Total Saved
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                {formatCurrency(analyticsData.overview.totalSaved)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All-time savings
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Performance Trends" />
            <Tab label="Category Breakdown" />
            <Tab label="Savings Pattern" />
            <Tab label="Athletic Profile" />
          </Tabs>
        </Box>

        {/* Performance Trends Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 300 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Daily Performance History
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Performance Score']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke={athleticColors.primary}
                      fillOpacity={0.3}
                      fill={athleticColors.primary}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Weekly Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={analyticsData.weeklyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="excellent" stackId="a" fill={athleticColors.victory} />
                    <Bar dataKey="good" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="neutral" stackId="a" fill="#6b7280" />
                    <Bar dataKey="poor" stackId="a" fill="#f59e0b" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Category Breakdown Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Performance Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ category, value }) => `${category}: ${value}%`}
                    >
                      {analyticsData.categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Performance Consistency
              </Typography>
              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Consistency Score: {analyticsData.overview.consistency}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={analyticsData.overview.consistency} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: athleticColors.primary,
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Best Week Average: {analyticsData.overview.bestWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Worst Week Average: {analyticsData.overview.worstWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance Range: {(analyticsData.overview.bestWeek - analyticsData.overview.worstWeek).toFixed(1)} points
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Savings Pattern Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Monthly Savings vs Targets
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analyticsData.savingsPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                <Bar dataKey="saved" fill={athleticColors.primary} name="Actual Saved" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* Athletic Profile Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Athletic Performance Radar
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analyticsData.performanceRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={0} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke={athleticColors.primary}
                      fill={athleticColors.primary}
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Performance Insights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analyticsData.insights.map((insight: any, index: number) => (
                  <Card key={index} sx={{ border: '1px solid #f1f5f9' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar sx={{ 
                          backgroundColor: insight.type === 'positive' ? 'rgba(16, 185, 129, 0.2)'
                                          : insight.type === 'achievement' ? 'rgba(255, 215, 0, 0.2)'
                                          : 'rgba(59, 130, 246, 0.2)',
                          width: 40,
                          height: 40,
                          fontSize: '1.2rem'
                        }}>
                          {insight.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {insight.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </AnalyticsContainer>
  );
};

export default PerformanceAnalytics;