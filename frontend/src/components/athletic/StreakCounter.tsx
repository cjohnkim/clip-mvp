import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { TrendingUp, Whatshot, EmojiEvents, Info } from '@mui/icons-material';
import { athleticColors, getStreakColor, athleticAnimations } from '../../theme/athleticTheme';

// Fire animation for active streaks
const fireAnimation = keyframes`
  0%, 100% { transform: scale(1) rotate(-1deg); }
  25% { transform: scale(1.05) rotate(1deg); }
  50% { transform: scale(1.02) rotate(-0.5deg); }
  75% { transform: scale(1.08) rotate(0.5deg); }
`;

const streakPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.6);
    transform: scale(1.02);
  }
`;

const numberCounter = keyframes`
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const StreakCard = styled(Card)<{ streakLevel: number; isActive: boolean }>(({ streakLevel, isActive }) => ({
  background: streakLevel >= 30 
    ? athleticColors.backgrounds.streak
    : streakLevel >= 7
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    
  color: 'white',
  borderRadius: '20px',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  animation: isActive && streakLevel >= 7 ? `${streakPulse} 2s ease-in-out infinite` : 'none',
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 12px 40px ${
      streakLevel >= 30 ? 'rgba(139, 92, 246, 0.4)'
      : streakLevel >= 7 ? 'rgba(245, 158, 11, 0.4)'
      : 'rgba(16, 185, 129, 0.4)'
    }`,
  },
  
  // Animated background particles for high streaks
  '&::before': streakLevel >= 30 ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
    animation: `${fireAnimation} 3s ease-in-out infinite`,
  } : {},
}));

const StreakNumber = styled(Typography)<{ isUpdating?: boolean }>(({ isUpdating }) => ({
  fontSize: '3rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1,
  position: 'relative',
  animation: isUpdating ? `${numberCounter} 0.5s ease-out` : 'none',
}));

const FireIcon = styled(Box)<{ streakLevel: number }>(({ streakLevel }) => ({
  fontSize: '2rem',
  marginLeft: '0.5rem',
  animation: streakLevel >= 7 ? `${fireAnimation} 2s ease-in-out infinite` : 'none',
  transform: streakLevel >= 30 ? 'scale(1.2)' : 'scale(1)',
  filter: streakLevel >= 30 ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' : 'none',
}));

const StreakMilestone = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '15px',
  backdropFilter: 'blur(10px)',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginTop: '1rem',
});

const ProgressRing = styled(Box)<{ progress: number; size: number }>(({ progress, size }) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: `conic-gradient(
    ${athleticColors.gold} 0deg ${progress * 3.6}deg,
    rgba(255, 255, 255, 0.2) ${progress * 3.6}deg 360deg
  )`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    width: size - 8,
    height: size - 8,
    borderRadius: '50%',
    background: 'inherit',
  },
}));

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastActiveDate: Date | null;
  isActive: boolean; // Whether user maintained streak today
  streakStartDate: Date | null;
}

interface StreakCounterProps {
  streakData: StreakData;
  size?: 'compact' | 'normal' | 'large';
  showDetails?: boolean;
  onStreakUpdate?: (newStreak: number) => void;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  streakData,
  size = 'normal',
  showDetails = true,
  onStreakUpdate,
}) => {
  const [prevStreak, setPrevStreak] = useState(streakData.currentStreak);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Animate number changes
  useEffect(() => {
    if (streakData.currentStreak !== prevStreak) {
      setIsUpdating(true);
      onStreakUpdate?.(streakData.currentStreak);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setPrevStreak(streakData.currentStreak);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [streakData.currentStreak, prevStreak, onStreakUpdate]);
  
  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return 4; // Legendary
    if (streak >= 30) return 3;  // Epic
    if (streak >= 7) return 2;   // Fire
    if (streak >= 3) return 1;   // Good
    return 0; // Starting
  };
  
  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return 'LEGENDARY ATHLETE! 🏆';
    if (streak >= 30) return 'ON FIRE! 🔥💜';
    if (streak >= 7) return 'STREAK MASTER! 🔥';
    if (streak >= 3) return 'Building Momentum! 💪';
    if (streak >= 1) return 'Getting Started! 🚀';
    return 'Start Your Journey!';
  };
  
  const getNextMilestone = (streak: number) => {
    if (streak < 3) return { target: 3, label: 'First Milestone' };
    if (streak < 7) return { target: 7, label: 'Week Warrior' };
    if (streak < 30) return { target: 30, label: 'Monthly Master' };
    if (streak < 100) return { target: 100, label: 'Legendary Status' };
    return { target: streak + 100, label: 'Next Century' };
  };
  
  const streakLevel = getStreakLevel(streakData.currentStreak);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const progressToNext = streakData.currentStreak < nextMilestone.target 
    ? (streakData.currentStreak / nextMilestone.target) * 100 
    : 100;
  
  const sizeConfig = {
    compact: { padding: '1rem', numberSize: '2rem', iconSize: '1.5rem' },
    normal: { padding: '1.5rem', numberSize: '3rem', iconSize: '2rem' },
    large: { padding: '2rem', numberSize: '4rem', iconSize: '2.5rem' },
  };
  
  const config = sizeConfig[size];
  
  return (
    <StreakCard 
      streakLevel={streakLevel} 
      isActive={streakData.isActive}
      elevation={0}
    >
      <CardContent sx={{ padding: config.padding }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
              Current Streak
            </Typography>
          </Box>
          
          {showDetails && (
            <Tooltip title="Streak builds when you stay under your daily spending target">
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Box display="flex" alignItems="center" mb={showDetails ? 2 : 0}>
          <StreakNumber 
            isUpdating={isUpdating}
            sx={{ fontSize: config.numberSize }}
          >
            {streakData.currentStreak}
          </StreakNumber>
          
          <FireIcon 
            streakLevel={streakLevel}
            sx={{ fontSize: config.iconSize }}
          >
            {streakLevel >= 3 ? '🔥' : streakLevel >= 1 ? '💪' : '🚀'}
          </FireIcon>
          
          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'right' }}>
              Best: {streakData.longestStreak}
            </Typography>
          </Box>
        </Box>
        
        {showDetails && (
          <>
            <StreakMilestone>
              <EmojiEvents sx={{ fontSize: '1rem' }} />
              <Typography variant="body2">
                {getStreakMessage(streakData.currentStreak)}
              </Typography>
            </StreakMilestone>
            
            {streakData.currentStreak < nextMilestone.target && (
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Next: {nextMilestone.label}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    {nextMilestone.target - streakData.currentStreak} days to go
                  </Typography>
                </Box>
                
                <Box sx={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    width: `${progressToNext}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
                    transition: 'width 1s ease',
                    borderRadius: '3px',
                  }} />
                </Box>
              </Box>
            )}
            
            <Box mt={2} display="flex" justifyContent="space-between" sx={{ opacity: 0.8 }}>
              <Typography variant="caption">
                Total Training Days: {streakData.totalDays}
              </Typography>
              {streakData.lastActiveDate && (
                <Typography variant="caption">
                  Active: {streakData.lastActiveDate.toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </StreakCard>
  );
};

export default StreakCounter;