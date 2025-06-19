import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, Zoom } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { athleticColors, athleticAnimations } from '../../theme/athleticTheme';

// Achievement unlock animation
const unlockAnimation = keyframes`
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(-10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
`;

const BadgeContainer = styled(Box)<{ 
  unlocked: boolean; 
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  justUnlocked?: boolean;
}>(({ unlocked, tier, justUnlocked }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  background: unlocked 
    ? tier === 'gold' ? `linear-gradient(135deg, ${athleticColors.gold} 0%, #f59e0b 100%)`
    : tier === 'silver' ? `linear-gradient(135deg, ${athleticColors.silver} 0%, #9ca3af 100%)`
    : tier === 'bronze' ? `linear-gradient(135deg, ${athleticColors.bronze} 0%, #92400e 100%)`
    : `linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)` // platinum
    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
    
  border: unlocked ? '3px solid #ffffff' : '3px solid #e5e7eb',
  
  animation: justUnlocked ? `${unlockAnimation} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)` : 
             unlocked && tier === 'gold' ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
  
  '&:hover': {
    transform: unlocked ? 'scale(1.1) translateY(-2px)' : 'scale(1.05)',
    boxShadow: unlocked 
      ? `0 8px 30px ${tier === 'gold' ? 'rgba(255, 215, 0, 0.4)' 
                     : tier === 'silver' ? 'rgba(192, 192, 192, 0.4)'
                     : tier === 'bronze' ? 'rgba(205, 127, 50, 0.4)'
                     : 'rgba(168, 85, 247, 0.4)'}`
      : '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  
  // Locked state overlay
  '&::after': unlocked ? {} : {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const BadgeIcon = styled(Typography)<{ unlocked: boolean }>(({ unlocked }) => ({
  fontSize: '2rem',
  opacity: unlocked ? 1 : 0.3,
  filter: unlocked ? 'none' : 'grayscale(100%)',
  transition: 'all 0.3s ease',
}));

const BadgeLabel = styled(Typography)<{ unlocked: boolean }>(({ unlocked }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  textAlign: 'center',
  marginTop: '0.5rem',
  color: unlocked ? '#0a2540' : '#9ca3af',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}));

// Celebration effect component
const CelebrationEffect = styled(Box)({
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  right: '-10px',
  bottom: '-10px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
  animation: `${pulseGlow} 1s ease-in-out`,
  pointerEvents: 'none',
});

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100 for partially completed achievements
  category: 'streak' | 'savings' | 'performance' | 'challenge' | 'milestone';
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showProgress?: boolean;
  onUnlock?: (achievement: Achievement) => void;
  justUnlocked?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showLabel = true,
  showProgress = false,
  onUnlock,
  justUnlocked = false,
}) => {
  const [celebrateUnlock, setCelebrateUnlock] = useState(false);
  
  // Trigger celebration effect when achievement unlocks
  useEffect(() => {
    if (justUnlocked && achievement.unlocked) {
      setCelebrateUnlock(true);
      onUnlock?.(achievement);
      
      // Remove celebration effect after animation
      const timer = setTimeout(() => {
        setCelebrateUnlock(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [justUnlocked, achievement.unlocked, onUnlock, achievement]);
  
  const sizeMap = {
    small: { container: 60, icon: '1.5rem', label: '0.7rem' },
    medium: { container: 80, icon: '2rem', label: '0.75rem' },
    large: { container: 100, icon: '2.5rem', label: '0.875rem' },
  };
  
  const currentSize = sizeMap[size];
  
  const tooltipContent = (
    <Box sx={{ textAlign: 'center', p: 1 }}>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        {achievement.title}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
        {achievement.description}
      </Typography>
      <Typography variant="caption" sx={{ 
        color: achievement.unlocked ? athleticColors.victory : '#9ca3af',
        fontWeight: 600,
      }}>
        {achievement.unlocked 
          ? `Unlocked ${achievement.unlockedAt?.toLocaleDateString()}`
          : achievement.requirement
        }
      </Typography>
      {showProgress && !achievement.unlocked && achievement.progress !== undefined && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: 'rgba(255,255,255,0.3)', 
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <Box sx={{
              width: `${achievement.progress}%`,
              height: '100%',
              backgroundColor: athleticColors.primary,
              transition: 'width 0.5s ease',
            }} />
          </Box>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {achievement.progress}% Complete
          </Typography>
        </Box>
      )}
    </Box>
  );
  
  return (
    <Tooltip 
      title={tooltipContent} 
      placement="top"
      TransitionComponent={Zoom}
      arrow
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BadgeContainer
          unlocked={achievement.unlocked}
          tier={achievement.tier}
          justUnlocked={celebrateUnlock}
          sx={{ 
            width: currentSize.container,
            height: currentSize.container,
          }}
        >
          {celebrateUnlock && <CelebrationEffect />}
          
          <BadgeIcon 
            unlocked={achievement.unlocked}
            sx={{ fontSize: currentSize.icon }}
          >
            {achievement.icon}
          </BadgeIcon>
          
          {!achievement.unlocked && (
            <Box sx={{
              position: 'absolute',
              fontSize: '1.5rem',
              color: '#9ca3af',
            }}>
              🔒
            </Box>
          )}
        </BadgeContainer>
        
        {showLabel && (
          <BadgeLabel 
            unlocked={achievement.unlocked}
            sx={{ fontSize: currentSize.label }}
          >
            {achievement.title}
          </BadgeLabel>
        )}
      </Box>
    </Tooltip>
  );
};

export default AchievementBadge;