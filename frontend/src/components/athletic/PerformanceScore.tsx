import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  TrendingUp, 
  TrendingDown, 
  Remove,
  SportsMma,
  EmojiEvents,
  LocalFireDepartment,
  Info
} from '@mui/icons-material';
import { 
  performanceColors, 
  athleticColors, 
  getPerformanceStyle, 
  getPerformanceScore 
} from '../../theme/athleticTheme';

// Performance animations
const scoreCounter = keyframes`
  0% { transform: scale(0.5) rotateY(180deg); opacity: 0; }
  50% { transform: scale(1.1) rotateY(0deg); opacity: 1; }
  100% { transform: scale(1) rotateY(0deg); opacity: 1; }
`;

const excellentGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(16, 185, 129, 0.6);
    transform: scale(1.02);
  }
`;

const criticalPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
  }
  50% { 
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
  }
`;

const PerformanceCard = styled(Card)<{ 
  performance: keyof typeof performanceColors;
  isAnimating?: boolean;
}>(({ performance, isAnimating }) => {
  const style = getPerformanceStyle(performance);
  
  return {
    background: style.background,
    borderRadius: '24px',
    border: 'none',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    transform: style.transform,
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    animation: isAnimating 
      ? performance === 'excellent' ? `${excellentGlow} 2s ease-in-out infinite`
        : performance === 'critical' ? `${criticalPulse} 1.5s ease-in-out infinite`
        : 'none'
      : 'none',
    
    '&:hover': {
      transform: `${style.transform} translateY(-4px)`,
      boxShadow: `${style.shadow}, 0 12px 40px rgba(0,0,0,0.15)`,
    },
    
    // Performance level indicator stripe
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: performance === 'excellent' ? athleticColors.gold
                : performance === 'good' ? '#60a5fa'
                : performance === 'neutral' ? '#9ca3af'
                : performance === 'poor' ? '#fbbf24'
                : '#f87171',
    },
  };
});

const ScoreDisplay = styled(Typography)<{ isUpdating?: boolean }>(({ isUpdating }) => ({
  fontSize: '4rem',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1,
  textAlign: 'center',
  position: 'relative',
  animation: isUpdating ? `${scoreCounter} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)` : 'none',
}));

const PerformanceMeter = styled(Box)<{ score: number }>(({ score }) => ({
  width: '100%',
  height: '12px',
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  overflow: 'hidden',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${score}%`,
    background: score >= 80 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
             : score >= 60 ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
             : score >= 40 ? 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)'
             : score >= 20 ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
             : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
    borderRadius: '6px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const StatChip = styled(Chip)<{ variant: 'positive' | 'negative' | 'neutral' }>(({ variant }) => ({
  backgroundColor: variant === 'positive' ? 'rgba(16, 185, 129, 0.2)'
                  : variant === 'negative' ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

export interface PerformanceData {
  score: number; // 0-100 performance score
  spentToday: number;
  targetToday: number;
  savedAmount: number; // Positive if under budget, negative if over
  streakImpact: boolean; // Whether this performance affects streak
  previousScore?: number;
  weekAverage: number;
  monthAverage: number;
  personalBest: number;
  category: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical';
}

interface PerformanceScoreProps {
  performanceData: PerformanceData;
  size?: 'compact' | 'normal' | 'large';
  showDetails?: boolean;
  showComparison?: boolean;
  animated?: boolean;
  onScoreUpdate?: (newScore: number) => void;
}

const PerformanceScore: React.FC<PerformanceScoreProps> = ({
  performanceData,
  size = 'normal',
  showDetails = true,
  showComparison = true,
  animated = true,
  onScoreUpdate,
}) => {
  const [prevScore, setPrevScore] = useState(performanceData.score);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Animate score changes
  useEffect(() => {
    if (performanceData.score !== prevScore) {
      setIsUpdating(true);
      onScoreUpdate?.(performanceData.score);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setPrevScore(performanceData.score);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [performanceData.score, prevScore, onScoreUpdate]);
  
  // Trigger performance animations
  useEffect(() => {
    if (animated && (performanceData.category === 'excellent' || performanceData.category === 'critical')) {
      setShowAnimation(true);
    } else {
      setShowAnimation(false);
    }
  }, [performanceData.category, animated]);
  
  const getPerformanceIcon = (category: string) => {
    switch (category) {
      case 'excellent': return <EmojiEvents sx={{ fontSize: '2rem' }} />;
      case 'good': return <TrendingUp sx={{ fontSize: '2rem' }} />;
      case 'neutral': return <Remove sx={{ fontSize: '2rem' }} />;
      case 'poor': return <TrendingDown sx={{ fontSize: '2rem' }} />;
      case 'critical': return <LocalFireDepartment sx={{ fontSize: '2rem' }} />;
      default: return <SportsMma sx={{ fontSize: '2rem' }} />;
    }
  };
  
  const getPerformanceMessage = (category: string, savedAmount: number) => {
    switch (category) {
      case 'excellent': 
        return `+$${Math.abs(savedAmount).toFixed(0)} banked! Champion performance! 🏆`;
      case 'good':
        return `+$${Math.abs(savedAmount).toFixed(0)} saved! Strong training session! 💪`;
      case 'neutral':
        return `Target hit! Steady performance, level up tomorrow! ⚡`;
      case 'poor':
        return `$${Math.abs(savedAmount).toFixed(0)} over target. Time to optimize! 🎯`;
      case 'critical':
        return `$${Math.abs(savedAmount).toFixed(0)} over budget. Recovery mode activated! 🔄`;
      default:
        return 'Keep training like a financial athlete!';
    }
  };
  
  const sizeConfig = {
    compact: { padding: '1rem', scoreSize: '2.5rem', spacing: 1 },
    normal: { padding: '1.5rem', scoreSize: '4rem', spacing: 2 },
    large: { padding: '2rem', scoreSize: '5rem', spacing: 3 },
  };
  
  const config = sizeConfig[size];
  
  return (
    <PerformanceCard 
      performance={performanceData.category}
      isAnimating={showAnimation}
      elevation={0}
    >
      <CardContent sx={{ padding: config.padding }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={config.spacing}>
          <Box display="flex" alignItems="center">
            <SportsMma sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
              Performance Score
            </Typography>
          </Box>
          
          {showDetails && (
            <Tooltip title="Score based on spending vs daily target. 100 = saved everything, 0 = spent 2x target">
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="center" mb={config.spacing}>
          <Box display="flex" alignItems="center" gap={2}>
            {getPerformanceIcon(performanceData.category)}
            <ScoreDisplay 
              isUpdating={isUpdating}
              sx={{ fontSize: config.scoreSize }}
            >
              {Math.round(performanceData.score)}
            </ScoreDisplay>
            <Typography variant="h4" sx={{ opacity: 0.8, fontWeight: 300 }}>
              /100
            </Typography>
          </Box>
        </Box>
        
        <PerformanceMeter score={performanceData.score} />
        
        {showDetails && (
          <Box mt={config.spacing}>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 600, 
                mb: 2,
                fontSize: size === 'compact' ? '0.875rem' : '1rem'
              }}
            >
              {getPerformanceMessage(performanceData.category, performanceData.savedAmount)}
            </Typography>
            
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              <StatChip
                variant={performanceData.savedAmount >= 0 ? 'positive' : 'negative'}
                icon={performanceData.savedAmount >= 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${performanceData.savedAmount >= 0 ? '+' : ''}$${performanceData.savedAmount.toFixed(0)}`}
                size="small"
              />
              
              {performanceData.streakImpact && (
                <StatChip
                  variant="positive"
                  icon={<LocalFireDepartment />}
                  label="Streak+"
                  size="small"
                />
              )}
              
              {performanceData.score > performanceData.personalBest && (
                <StatChip
                  variant="positive"
                  icon={<EmojiEvents />}
                  label="Personal Best!"
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}
        
        {showComparison && showDetails && (
          <Box mt={config.spacing} sx={{ opacity: 0.8 }}>
            <Box display="flex" justifyContent="space-between" sx={{ fontSize: '0.875rem' }}>
              <Typography variant="caption">
                Week Avg: {Math.round(performanceData.weekAverage)}
              </Typography>
              <Typography variant="caption">
                Month Avg: {Math.round(performanceData.monthAverage)}
              </Typography>
              <Typography variant="caption">
                Personal Best: {Math.round(performanceData.personalBest)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </PerformanceCard>
  );
};

export default PerformanceScore;