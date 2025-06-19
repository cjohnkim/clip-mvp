import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart,
  Work,
  Savings
} from '@mui/icons-material';
import { calculationService } from '../../services/calculationService';

interface DailyAllowanceDay {
  date: string;
  baseAllowance: number;
  actualSpend: number; // What was actually spent this day
  allowanceImpact: number; // How this day affects future allowances
  netChange: number; // Income - expenses for the day
  performance: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical'; // Performance vs allowance
  events: Array<{
    type: 'income' | 'expense';
    name: string;
    amount: number;
    category?: string;
  }>;
  daysFromToday: number;
  isToday: boolean;
  isPast: boolean;
}

export default function Timeline() {
  const navigate = useNavigate();
  const [days, setDays] = useState<DailyAllowanceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const response = await calculationService.getCashFlow(30);
      
      // Transform cash flow data into daily allowance tracking
      const today = new Date();
      const timelineData: DailyAllowanceDay[] = response.data.timeline.map((day: any, index: number) => {
        const dayDate = new Date(day.date);
        const daysFromToday = Math.floor((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate allowance impact based on net change
        const netChange = day.income - day.expenses;
        const baseAllowance = 45 + (index * 0.5); // Gradually increasing allowance over time
        const actualSpend = day.expenses || (Math.random() * baseAllowance * 1.2); // Mock actual spending
        
        // Calculate performance vs allowance
        const spendRatio = actualSpend / baseAllowance;
        let performance: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical';
        
        if (spendRatio <= 0.7) performance = 'excellent';
        else if (spendRatio <= 0.9) performance = 'good';
        else if (spendRatio <= 1.1) performance = 'neutral';
        else if (spendRatio <= 1.3) performance = 'poor';
        else performance = 'critical';
        
        // Allowance impact based on performance
        let allowanceImpact = 0;
        if (performance === 'excellent') allowanceImpact = baseAllowance * 0.1;
        else if (performance === 'good') allowanceImpact = baseAllowance * 0.05;
        else if (performance === 'poor') allowanceImpact = -baseAllowance * 0.05;
        else if (performance === 'critical') allowanceImpact = -baseAllowance * 0.1;
        
        // Create events for the day
        const events: any[] = [];
        if (day.income_items) {
          day.income_items.forEach((income: any) => {
            events.push({
              type: 'income',
              name: income.name,
              amount: income.amount,
              category: income.source
            });
          });
        }
        if (day.expense_items) {
          day.expense_items.forEach((expense: any) => {
            events.push({
              type: 'expense', 
              name: expense.name,
              amount: expense.amount,
              category: expense.category
            });
          });
        }

        return {
          date: day.date,
          baseAllowance,
          actualSpend,
          allowanceImpact,
          netChange,
          performance,
          events,
          daysFromToday,
          isToday: daysFromToday === 0,
          isPast: daysFromToday < 0,
        };
      });

      setDays(timelineData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load timeline');
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `${Math.abs(diffDays)} days ago`;
      } else if (diffDays < 7) {
        return `in ${diffDays} days`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    }
  };

  const getAllowanceImpactMessage = (day: DailyAllowanceDay) => {
    if (day.allowanceImpact > 0) {
      return `+${formatCurrency(day.allowanceImpact)} to future allowances`;
    } else if (day.allowanceImpact < 0) {
      return `${formatCurrency(day.allowanceImpact)} from future allowances`;
    }
    return 'No impact on future allowances';
  };

  const getAllowanceImpactColor = (impact: number) => {
    if (impact > 0) return 'success.main';
    if (impact < 0) return 'error.main';
    return 'text.secondary';
  };

  const getAllowanceIcon = (day: DailyAllowanceDay) => {
    if (day.allowanceImpact > 0) return <TrendingUp />;
    if (day.allowanceImpact < 0) return <TrendingDown />;
    return <Savings />;
  };

  const getPerformanceStyle = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          scale: 1.05,
          shadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
        };
      case 'good':
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          scale: 1.02,
          shadow: '0 6px 20px rgba(59, 130, 246, 0.25)',
        };
      case 'neutral':
        return {
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          scale: 1,
          shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        };
      case 'poor':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          scale: 0.98,
          shadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
        };
      case 'critical':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          scale: 0.95,
          shadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          background: 'white',
          scale: 1,
          shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        };
    }
  };

  const getPerformanceMessage = (day: DailyAllowanceDay) => {
    const savings = day.baseAllowance - day.actualSpend;
    switch (day.performance) {
      case 'excellent':
        return `+${formatCurrency(savings)} banked! Crushing it 🚀`;
      case 'good':
        return `+${formatCurrency(savings)} saved - strong performance 🔥`;
      case 'neutral':
        return `Baseline hit - level up for tomorrow ⚡`;
      case 'poor':
        return `${formatCurrency(-savings)} over - time to optimize 🎯`;
      case 'critical':
        return `${formatCurrency(-savings)} over - game reset needed 🔄`;
      default:
        return '';
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

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  color: '#0a2540',
                  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                  fontWeight: 700,
                }}
              >
                Financial Momentum
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{
                  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                  fontWeight: 400,
                }}
              >
                Level up your financial game, one day at a time
              </Typography>
            </Box>

            {/* Trend Chart */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 4, 
                p: 3,
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#0a2540' }}>
                Daily Performance Tracker
              </Typography>
              <Box sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                {/* Trend Line Chart */}
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
                  
                  {/* Baseline (zero savings) */}
                  <line
                    x1="0"
                    y1="180"
                    x2="800"
                    y2="180"
                    stroke="#00d4aa"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Savings trend line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={days.map((day, index) => {
                      const x = (index / (days.length - 1)) * 800;
                      const dollarsForward = day.baseAllowance - day.actualSpend;
                      // Scale: $0 saved = y:180, $45 saved = y:20 (max allowance saved)
                      const y = 180 - (dollarsForward / day.baseAllowance) * 160;
                      return `${x},${Math.max(20, Math.min(200, y))}`;
                    }).join(' ')}
                  />
                  
                  {/* Savings dots */}
                  {days.map((day, index) => {
                    const x = (index / (days.length - 1)) * 800;
                    const dollarsForward = day.baseAllowance - day.actualSpend;
                    const y = 180 - (dollarsForward / day.baseAllowance) * 160;
                    
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={Math.max(20, Math.min(200, y))}
                        r={day.isToday ? "8" : "5"}
                        fill={day.performance === 'excellent' ? '#10b981' : 
                              day.performance === 'good' ? '#3b82f6' :
                              day.performance === 'neutral' ? '#6b7280' :
                              day.performance === 'poor' ? '#f59e0b' : '#ef4444'}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Labels */}
                  <text x="10" y="25" fill="#10b981" fontSize="14" fontFamily="Inter" fontWeight="600">💰 All Dollars Saved!</text>
                  <text x="10" y="185" fill="#00d4aa" fontSize="12" fontFamily="Inter">Zero Saved (Spent Full Allowance)</text>
                  <text x="10" y="200" fill="#ef4444" fontSize="12" fontFamily="Inter">Borrowed from Future</text>
                </svg>
              </Box>
            </Card>

            {/* Performance Cards with Visual Weight */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {days.slice(0, 10).map((day, index) => {
                const style = getPerformanceStyle(day.performance);
                const daysGap = index > 0 ? Math.abs(day.daysFromToday - days[index-1].daysFromToday) : 0;
                
                return (
                  <Box
                    key={day.date}
                    sx={{
                      mt: daysGap > 1 ? daysGap * 8 : 0, // Proportional spacing
                      transform: `scale(${style.scale})`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        background: style.background,
                        boxShadow: style.shadow,
                        borderRadius: '16px',
                        color: 'white',
                        border: day.isToday ? '3px solid #635bff' : 'none',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `${style.shadow}, 0 10px 30px rgba(0,0,0,0.1)`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              sx={{ fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif' }}
                            >
                              {formatDate(day.date)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ opacity: 0.9, fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif' }}
                            >
                              {getPerformanceMessage(day)}
                            </Typography>
                          </Box>
                          
                          <Box textAlign="right">
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {formatCurrency(day.actualSpend)}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              vs {formatCurrency(day.baseAllowance)} baseline
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress bar showing spend vs allowance */}
                        <Box sx={{ mt: 2 }}>
                          <Box 
                            sx={{
                              width: '100%',
                              height: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.min(100, (day.actualSpend / day.baseAllowance) * 100)}%`,
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: 4,
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Events for the day */}
                        {day.events.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={1}>
                              {day.events.map((event, eventIndex) => (
                                <Grid item xs="auto" key={eventIndex}>
                                  <Chip
                                    icon={event.type === 'income' ? <TrendingUp /> : <ShoppingCart />}
                                    label={`${event.type === 'income' ? '+' : '-'}${formatCurrency(event.amount)} ${event.name}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: event.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      color: 'white',
                                      fontWeight: 500,
                                      '& .MuiChip-icon': {
                                        color: 'white'
                                      }
                                    }}
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Container>
    </>
  );
}