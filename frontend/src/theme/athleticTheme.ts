import { createTheme } from '@mui/material/styles';

// Athletic/Gaming Performance Color System
export const performanceColors = {
  // Performance-based scaling colors
  excellent: {
    primary: '#10b981', // Bright green
    secondary: '#059669',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
    scale: 1.05,
  },
  good: {
    primary: '#3b82f6', // Blue  
    secondary: '#1d4ed8',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    shadow: '0 6px 20px rgba(59, 130, 246, 0.25)', 
    scale: 1.02,
  },
  neutral: {
    primary: '#6b7280', // Gray
    secondary: '#4b5563',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    scale: 1.0,
  },
  poor: {
    primary: '#f59e0b', // Orange/Yellow
    secondary: '#d97706', 
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
    scale: 0.98,
  },
  critical: {
    primary: '#ef4444', // Red
    secondary: '#dc2626',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
    shadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
    scale: 0.95,
  },
};

// Clip brand colors - clean and focused
export const athleticColors = {
  // Primary brand (simple black/white)
  primary: '#000000',
  primaryDark: '#333333',
  
  // Achievement colors
  gold: '#ffd700',
  silver: '#c0c0c0', 
  bronze: '#cd7f32',
  
  // Streak fire colors
  streak: {
    1: '#f59e0b',   // 1-3 days: orange
    7: '#ef4444',   // 7+ days: red  
    30: '#8b5cf6',  // 30+ days: purple
    100: '#ffd700', // 100+ days: gold
  },
  
  // Gaming UI colors
  xp: '#7c3aed',        // Experience points purple
  level: '#06b6d4',     // Level cyan
  challenge: '#f59e0b', // Daily challenge orange
  victory: '#10b981',   // Victory/win green
  
  // Background gradients
  backgrounds: {
    app: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    hero: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
    achievement: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
    streak: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  }
};

// Clean Typography - marketing site style
export const athleticTypography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Arial',
    'sans-serif'
  ].join(','),
  
  // Athletic component text styles
  components: {
    heroNumber: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    performanceScore: {
      fontSize: '2.5rem', 
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    streakCounter: {
      fontSize: '2rem',
      fontWeight: 700, 
      letterSpacing: '0.02em',
    },
    achievementTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    athleticBody: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    performanceLabel: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    }
  }
};

// Athletic spacing system
export const athleticSpacing = {
  // Card spacing based on performance
  cardPadding: {
    excellent: '2rem',
    good: '1.75rem', 
    neutral: '1.5rem',
    poor: '1.25rem',
    critical: '1rem',
  },
  
  // Component spacing
  section: '4rem',
  cardGap: '1.5rem',
  elementGap: '1rem',
  tight: '0.5rem',
};

// Athletic animations
export const athleticAnimations = {
  // Performance-based transitions
  cardHover: {
    excellent: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    good: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    neutral: 'all 0.3s ease',
    poor: 'all 0.3s ease-in-out',
    critical: 'all 0.3s ease-in',
  },
  
  // Achievement animations
  achievementUnlock: 'scale 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  streakPulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  progressFill: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Celebration effects
  confetti: 'bounce 0.6s ease-in-out',
  celebrate: 'tada 1s ease-in-out',
};

// Main Athletic Theme
export const athleticTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: athleticColors.primary,
      dark: athleticColors.primaryDark,
    },
    secondary: {
      main: performanceColors.excellent.primary,
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a2540',
      secondary: '#425466',
    },
    success: {
      main: performanceColors.excellent.primary,
    },
    warning: {
      main: performanceColors.poor.primary,
    },
    error: {
      main: performanceColors.critical.primary,
    },
    info: {
      main: performanceColors.good.primary,
    },
  },
  
  typography: {
    fontFamily: athleticTypography.fontFamily,
    h1: {
      ...athleticTypography.components.heroNumber,
    },
    h2: {
      ...athleticTypography.components.performanceScore,
    },
    h3: {
      ...athleticTypography.components.streakCounter,
    },
    h4: {
      ...athleticTypography.components.achievementTitle,
    },
    body1: {
      ...athleticTypography.components.athleticBody,
    },
    body2: {
      ...athleticTypography.components.performanceLabel,
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 20px rgba(0, 212, 170, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 212, 170, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        contained: {
          background: athleticColors.backgrounds.hero,
          boxShadow: '0 4px 15px rgba(0, 212, 170, 0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 212, 170, 0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '20px',
        },
      },
    },
  },
});

// Helper functions for athletic styling
export const getPerformanceStyle = (performance: keyof typeof performanceColors) => {
  const perf = performanceColors[performance];
  return {
    background: perf.background,
    boxShadow: perf.shadow,
    shadow: perf.shadow,
    transform: `scale(${perf.scale})`,
    transition: athleticAnimations.cardHover[performance],
  };
};

export const getStreakColor = (days: number) => {
  if (days >= 100) return athleticColors.streak[100];
  if (days >= 30) return athleticColors.streak[30]; 
  if (days >= 7) return athleticColors.streak[7];
  return athleticColors.streak[1];
};

export const getPerformanceScore = (spent: number, target: number): keyof typeof performanceColors => {
  const ratio = spent / target;
  if (ratio <= 0.7) return 'excellent';
  if (ratio <= 0.9) return 'good';
  if (ratio <= 1.1) return 'neutral';
  if (ratio <= 1.3) return 'poor';
  return 'critical';
};