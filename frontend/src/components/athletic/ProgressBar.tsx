import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  TrendingUp, 
  SavingsOutlined, 
  TimerOutlined,
  EmojiEvents,
  Speed
} from '@mui/icons-material';
import { athleticColors } from '../../theme/athleticTheme';

// Progress fill animation
const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--target-width); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const victoryPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
    transform: scale(1.02);
  }
`;

const ProgressContainer = styled(Card)<{ isComplete?: boolean; variant?: string }>(({ isComplete, variant }) => ({
  borderRadius: '16px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 20px rgba(0, 212, 170, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  background: variant === 'hero' 
    ? athleticColors.backgrounds.card
    : 'white',
    
  animation: isComplete ? `${victoryPulse} 2s ease-in-out infinite` : 'none',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 212, 170, 0.15)',
  },
}));

const ProgressTrack = styled(Box)<{ height: number }>(({ height }) => ({
  width: '100%',
  height: `${height}px`,
  backgroundColor: '#f1f5f9',
  borderRadius: `${height / 2}px`,
  overflow: 'hidden',
  position: 'relative',
}));

const ProgressFill = styled(Box)<{ 
  progress: number; 
  color: string; 
  animated?: boolean;
  isComplete?: boolean;
}>(({ progress, color, animated, isComplete }) => ({
  height: '100%',
  background: isComplete 
    ? `linear-gradient(90deg, ${athleticColors.gold} 0%, #f59e0b 100%)`
    : `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
  borderRadius: 'inherit',
  transition: animated ? 'none' : 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  width: `${progress}%`,
  position: 'relative',
  
  // Shimmer effect for active progress
  '&::after': animated ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
    animation: `${shimmer} 2s ease-in-out infinite`,
  } : {},
  
  // Completion sparkle effect
  '&::before': isComplete ? {
    content: '""',
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    animation: `${victoryPulse} 1s ease-in-out infinite`,
  } : {},
}));

const StatusChip = styled(Chip)<{ status: 'ahead' | 'onTrack' | 'behind' | 'complete' }>(({ status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  backgroundColor: status === 'complete' ? athleticColors.gold
                  : status === 'ahead' ? 'rgba(16, 185, 129, 0.2)'
                  : status === 'onTrack' ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(245, 158, 11, 0.2)',
  color: status === 'complete' ? 'white'
        : status === 'ahead' ? '#059669'
        : status === 'onTrack' ? '#1d4ed8'
        : '#d97706',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

export interface ProgressData {
  current: number;
  target: number;
  label: string;
  sublabel?: string;
  timeframe?: string;
  startDate?: Date;
  targetDate?: Date;
  category: 'savings' | 'emergency' | 'goal' | 'debt' | 'investment';
  milestones?: Array<{
    value: number;
    label: string;
    achieved: boolean;
  }>;
}

interface ProgressBarProps {
  data: ProgressData;
  variant?: 'default' | 'hero' | 'compact';
  height?: number;
  showStatus?: boolean;
  showTimeframe?: boolean;
  showMilestones?: boolean;
  animated?: boolean;
  onMilestoneReached?: (milestone: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  data,
  variant = 'default',
  height = 12,
  showStatus = true,
  showTimeframe = true,
  showMilestones = false,
  animated = true,
  onMilestoneReached,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [previousProgress, setPreviousProgress] = useState(0);
  
  const progress = Math.min((data.current / data.target) * 100, 100);
  const isComplete = progress >= 100;
  
  // Animate progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    
    // Check for milestone achievements
    if (data.milestones && progress > previousProgress) {
      data.milestones.forEach(milestone => {
        const milestoneProgress = (milestone.value / data.target) * 100;
        if (progress >= milestoneProgress && previousProgress < milestoneProgress && !milestone.achieved) {
          onMilestoneReached?.(milestone.value);
        }
      });
    }
    
    setPreviousProgress(progress);
    return () => clearTimeout(timer);
  }, [progress, previousProgress, data.milestones, onMilestoneReached]);
  
  const getProgressColor = () => {
    if (isComplete) return athleticColors.gold;
    if (progress >= 80) return athleticColors.primary;
    if (progress >= 60) return '#10b981';
    if (progress >= 40) return '#3b82f6';
    if (progress >= 20) return '#6b7280';
    return '#f59e0b';
  };
  
  const getProgressStatus = (): 'ahead' | 'onTrack' | 'behind' | 'complete' => {
    if (isComplete) return 'complete';
    
    // Calculate expected progress based on time
    if (data.startDate && data.targetDate) {
      const totalTime = data.targetDate.getTime() - data.startDate.getTime();
      const elapsedTime = Date.now() - data.startDate.getTime();
      const expectedProgress = (elapsedTime / totalTime) * 100;
      
      if (progress > expectedProgress + 10) return 'ahead';
      if (progress < expectedProgress - 10) return 'behind';
      return 'onTrack';
    }
    
    return 'onTrack';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <EmojiEvents />;
      case 'ahead': return <Speed />;
      case 'onTrack': return <TrendingUp />;
      case 'behind': return <TimerOutlined />;
      default: return <SavingsOutlined />;
    }
  };
  
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'complete': return 'Goal Complete! 🎉';
      case 'ahead': return `${Math.round(progress - (data.current/data.target*100))}% ahead of schedule!`;
      case 'onTrack': return 'On track to hit your goal!';
      case 'behind': return 'Need to accelerate progress';
      default: return 'Making progress!';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getDaysRemaining = () => {
    if (!data.targetDate) return null;
    const days = Math.ceil((data.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  const status = getProgressStatus();
  const daysRemaining = getDaysRemaining();
  
  return (
    <ProgressContainer 
      isComplete={isComplete} 
      variant={variant}
      elevation={0}
    >
      <CardContent sx={{ 
        padding: variant === 'compact' ? '1rem' : '1.5rem',
        '&:last-child': { paddingBottom: variant === 'compact' ? '1rem' : '1.5rem' }
      }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography 
              variant={variant === 'hero' ? 'h6' : 'body1'} 
              fontWeight={600}
              sx={{ color: '#0a2540' }}
            >
              {data.label}
            </Typography>
            {data.sublabel && (
              <Typography variant="body2" sx={{ color: '#8892b0', mt: 0.5 }}>
                {data.sublabel}
              </Typography>
            )}
          </Box>
          
          {showStatus && (
            <StatusChip
              status={status}
              icon={getStatusIcon(status)}
              label={status === 'complete' ? 'Complete!' : `${Math.round(progress)}%`}
              size="small"
            />
          )}
        </Box>
        
        {/* Progress Amount Display */}
        <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={1.5}>
          <Typography 
            variant={variant === 'hero' ? 'h4' : 'h5'} 
            fontWeight={700}
            sx={{ color: getProgressColor() }}
          >
            {formatCurrency(data.current)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#8892b0' }}>
            of {formatCurrency(data.target)}
          </Typography>
        </Box>
        
        {/* Progress Bar */}
        <ProgressTrack height={variant === 'hero' ? 16 : height}>
          <ProgressFill
            progress={displayProgress}
            color={getProgressColor()}
            animated={animated}
            isComplete={isComplete}
          />
        </ProgressTrack>
        
        {/* Milestones */}
        {showMilestones && data.milestones && (
          <Box mt={1.5}>
            <Box display="flex" justifyContent="space-between" position="relative">
              {data.milestones.map((milestone, index) => {
                const milestonePosition = (milestone.value / data.target) * 100;
                const isReached = (data.current / data.target) * 100 >= milestonePosition;
                
                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      left: `${milestonePosition}%`,
                      transform: 'translateX(-50%)',
                      textAlign: 'center',
                      top: '-8px',
                    }}
                  >
                    <Box
                      sx={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isReached ? athleticColors.gold : '#d1d5db',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        fontSize: '0.7rem',
                        color: isReached ? athleticColors.gold : '#8892b0',
                        fontWeight: isReached ? 600 : 400,
                      }}
                    >
                      {milestone.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        
        {/* Footer Info */}
        {showTimeframe && (daysRemaining !== null || data.timeframe) && (
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: '#8892b0' }}>
              {getStatusMessage(status)}
            </Typography>
            {daysRemaining !== null && (
              <Typography variant="caption" sx={{ color: '#8892b0' }}>
                {daysRemaining} days remaining
              </Typography>
            )}
            {data.timeframe && !daysRemaining && (
              <Typography variant="caption" sx={{ color: '#8892b0' }}>
                {data.timeframe}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </ProgressContainer>
  );
};

export default ProgressBar;