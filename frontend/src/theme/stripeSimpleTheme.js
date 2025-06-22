import { createTheme } from '@mui/material/styles';

// Stripe-inspired color palette married with Simple's philosophy
const colors = {
  // Primary Stripe purple
  primary: {
    50: '#f8f6ff',
    100: '#f1ecff',
    200: '#e6ddff',
    300: '#d4c2ff',
    400: '#bc9eff',
    500: '#635bff', // Main Stripe purple
    600: '#5a52e8',
    700: '#4c44d1',
    800: '#3d35b8',
    900: '#2d2799',
  },
  
  // Simple-inspired secondary colors
  secondary: {
    50: '#faf8ff',
    100: '#f0ecff',
    200: '#e1d9ff',
    300: '#cbb8ff',
    400: '#a78bfa',
    500: '#7c3aed',
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3c1a78',
  },
  
  // Clean grays inspired by both brands
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Stripe success green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Simple warning amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  }
};

const stripeSimpleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[500],
      light: colors.success[300],
      dark: colors.success[700],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[300],
      dark: colors.warning[700],
    },
    error: {
      main: colors.error[500],
      light: colors.error[300],
      dark: colors.error[700],
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a2540',
      secondary: '#425466',
      disabled: '#8892b0',
    },
    divider: '#e6ebf1',
  },
  
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    
    h1: {
      fontSize: '3.5rem',
      fontWeight: 500,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      color: '#0a2540',
    },
    
    h2: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#0a2540',
    },
    
    h3: {
      fontSize: '1.875rem',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      color: '#0a2540',
    },
    
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#0a2540',
    },
    
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#0a2540',
    },
    
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#0a2540',
    },
    
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#425466',
    },
    
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#425466',
    },
    
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#8892b0',
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.05)',
    '0 5px 15px rgba(0, 0, 0, 0.08)',
    '0 10px 24px rgba(0, 0, 0, 0.08)',
    '0 15px 35px rgba(0, 0, 0, 0.08)',
    '0 20px 40px rgba(0, 0, 0, 0.1)',
    '0 25px 50px rgba(0, 0, 0, 0.12)',
    '0 30px 60px rgba(0, 0, 0, 0.15)',
    // Stripe-style colored shadows
    '0 4px 14px rgba(99, 91, 255, 0.15)',
    '0 8px 25px rgba(99, 91, 255, 0.2)',
    '0 15px 35px rgba(99, 91, 255, 0.25)',
    '0 20px 40px rgba(99, 91, 255, 0.3)',
    // More dramatic shadows for cards
    '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
    // Special shadows for primary elements
    '0 8px 25px rgba(99, 91, 255, 0.3), 0 4px 12px rgba(99, 91, 255, 0.2)',
    '0 12px 35px rgba(99, 91, 255, 0.35), 0 6px 16px rgba(99, 91, 255, 0.25)',
    '0 16px 45px rgba(99, 91, 255, 0.4), 0 8px 20px rgba(99, 91, 255, 0.3)',
    // Ultra-dramatic hero shadows
    '0 20px 60px rgba(99, 91, 255, 0.45), 0 10px 25px rgba(99, 91, 255, 0.35)',
    '0 25px 75px rgba(99, 91, 255, 0.5), 0 12px 30px rgba(99, 91, 255, 0.4)',
    '0 30px 90px rgba(99, 91, 255, 0.55), 0 15px 35px rgba(99, 91, 255, 0.45)',
    '0 35px 105px rgba(99, 91, 255, 0.6), 0 18px 40px rgba(99, 91, 255, 0.5)',
    '0 40px 120px rgba(99, 91, 255, 0.65), 0 20px 45px rgba(99, 91, 255, 0.55)',
    '0 50px 150px rgba(99, 91, 255, 0.7), 0 25px 55px rgba(99, 91, 255, 0.6)',
  ],
  
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e6ebf1',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
          boxShadow: '0 4px 14px rgba(99, 91, 255, 0.2)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(99, 91, 255, 0.3)',
            background: 'linear-gradient(135deg, #5a52e8 0%, #6d28d9 100%)',
          },
        },
        outlined: {
          borderColor: '#d1d5db',
          color: '#374151',
          '&:hover': {
            borderColor: '#635bff',
            backgroundColor: 'rgba(99, 91, 255, 0.04)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: '#f3f4f6',
          color: '#374151',
        },
      },
    },
    
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e6ebf1',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        },
      },
    },
  },
});

// Custom gradients for different states
stripeSimpleTheme.gradients = {
  primary: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
  secondary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  
  // Background gradients
  heroBackground: 'linear-gradient(135deg, #fafbfc 0%, #f3f4f6 50%, #ffffff 100%)',
  cardBackground: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
  
  // Glassmorphism effects
  glass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  glassHover: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
};

// Custom colors for specific use cases
stripeSimpleTheme.customColors = {
  textPrimary: '#0a2540',
  textSecondary: '#425466',
  textTertiary: '#8892b0',
  borderLight: '#e6ebf1',
  borderMedium: '#d1d5db',
  backgroundLight: '#fafbfc',
  backgroundMedium: '#f3f4f6',
  accent: '#635bff',
  accentLight: '#f8f6ff',
};

export default stripeSimpleTheme;