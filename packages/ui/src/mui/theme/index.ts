import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Enhanced C4R color palette
const c4rColors = {
  primary: {
    main: '#6E00FF',
    dark: '#5700CA',
    light: '#8A33FF',
    lighter: '#B366FF',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#FF5A00',
    dark: '#E64A00',
    light: '#FF7733',
    lighter: '#FF9966',
    contrastText: '#ffffff',
  },
  accent: {
    main: '#00C802',
    dark: '#00A002',
    light: '#33D435',
    lighter: '#66E068',
    contrastText: '#ffffff',
  },
  // Extended semantic colors
  success: '#00C802',
  warning: '#FF5A00',
  error: '#EF4444',
  info: '#3B82F6',
  // Neutral grays (Tailwind-based)
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
} as const;

// Create enhanced theme with better component overrides
const createC4RTheme = (options: Partial<ThemeOptions> = {}) => {
  const baseTheme = createTheme({
    palette: {
      mode: 'light',
      primary: c4rColors.primary,
      secondary: c4rColors.secondary,
      success: {
        main: c4rColors.accent.main,
        dark: c4rColors.accent.dark,
        light: c4rColors.accent.light,
        contrastText: c4rColors.accent.contrastText,
      },
      warning: {
        main: c4rColors.secondary.main,
        dark: c4rColors.secondary.dark,
        light: c4rColors.secondary.light,
        contrastText: c4rColors.secondary.contrastText,
      },
      error: {
        main: '#EF4444',
        dark: '#DC2626',
        light: '#F87171',
        contrastText: '#ffffff',
      },
      info: {
        main: '#3B82F6',
        dark: '#2563EB',
        light: '#60A5FA',
        contrastText: '#ffffff',
      },
      grey: c4rColors.gray,
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      text: {
        primary: c4rColors.gray[900],
        secondary: c4rColors.gray[600],
        disabled: c4rColors.gray[400],
      },
      divider: c4rColors.gray[200],
    },

    typography: {
      fontFamily: [
        'General Sans',
        'GeneralSans-Regular',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      
      // Enhanced typography with better line heights and spacing
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
        fontFamily: 'GeneralSans-Semibold, General Sans, sans-serif',
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        fontFamily: 'GeneralSans-Semibold, General Sans, sans-serif',
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
        fontFamily: 'GeneralSans-Medium, General Sans, sans-serif',
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
        fontFamily: 'GeneralSans-Medium, General Sans, sans-serif',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        letterSpacing: '0.025em',
      },
    },

    shape: {
      borderRadius: 8,
    },

    spacing: 4,

    shadows: [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      // ... continue Tailwind shadow system
      ...Array(18).fill('0 25px 50px -12px rgb(0 0 0 / 0.25)'),
    ],

    ...options,
  });

  // Enhanced component overrides
  return createTheme(baseTheme, {
    components: {
      // Button enhancements
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            padding: '10px 20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: baseTheme.shadows[2],
            },
            '&:focus': {
              outline: `2px solid ${alpha(c4rColors.primary.main, 0.5)}`,
              outlineOffset: '2px',
            },
          },
          contained: {
            boxShadow: baseTheme.shadows[1],
            '&:hover': {
              boxShadow: baseTheme.shadows[3],
            },
            '&:active': {
              boxShadow: baseTheme.shadows[1],
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
        variants: [
          {
            props: { variant: 'c4rPrimary' },
            style: {
              backgroundColor: c4rColors.primary.main,
              color: c4rColors.primary.contrastText,
              '&:hover': {
                backgroundColor: c4rColors.primary.dark,
              },
              '&:disabled': {
                backgroundColor: alpha(c4rColors.primary.main, 0.5),
                color: c4rColors.primary.contrastText,
              },
            },
          },
          {
            props: { variant: 'c4rSecondary' },
            style: {
              backgroundColor: c4rColors.secondary.main,
              color: c4rColors.secondary.contrastText,
              '&:hover': {
                backgroundColor: c4rColors.secondary.dark,
              },
            },
          },
          {
            props: { variant: 'c4rAccent' },
            style: {
              backgroundColor: c4rColors.accent.main,
              color: c4rColors.accent.contrastText,
              '&:hover': {
                backgroundColor: c4rColors.accent.dark,
              },
            },
          },
          {
            props: { variant: 'ghost' },
            style: {
              backgroundColor: 'transparent',
              color: c4rColors.gray[700],
              border: 'none',
              '&:hover': {
                backgroundColor: alpha(c4rColors.gray[100], 0.8),
              },
            },
          },
        ],
      },

      // Enhanced Card styling
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${c4rColors.gray[200]}`,
            boxShadow: baseTheme.shadows[1],
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: baseTheme.shadows[3],
              transform: 'translateY(-1px)',
            },
          },
        },
        variants: [
          {
            props: { variant: 'elevated' },
            style: {
              boxShadow: baseTheme.shadows[3],
              '&:hover': {
                boxShadow: baseTheme.shadows[4],
              },
            },
          },
          {
            props: { variant: 'outlined' },
            style: {
              boxShadow: 'none',
              border: `2px solid ${c4rColors.gray[200]}`,
              '&:hover': {
                borderColor: c4rColors.gray[300],
                transform: 'none',
              },
            },
          },
        ],
      },

      // Enhanced TextField
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: c4rColors.gray[300],
                borderWidth: '2px',
              },
              '&:hover fieldset': {
                borderColor: c4rColors.gray[400],
              },
              '&.Mui-focused fieldset': {
                borderColor: c4rColors.primary.main,
                borderWidth: '2px',
              },
              '&.Mui-error fieldset': {
                borderColor: baseTheme.palette.error.main,
              },
            },
            '& .MuiInputLabel-root': {
              '&.Mui-focused': {
                color: c4rColors.primary.main,
              },
            },
          },
        },
      },

      // Enhanced Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: baseTheme.shadows[5],
          },
        },
      },

      // Enhanced Paper
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
        variants: [
          {
            props: { variant: 'activity' },
            style: {
              padding: baseTheme.spacing(3),
              border: `1px solid ${c4rColors.gray[200]}`,
              boxShadow: baseTheme.shadows[1],
            },
          },
        ],
      },

      // Enhanced Alert
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: 'none',
          },
          standardSuccess: {
            backgroundColor: alpha(c4rColors.accent.main, 0.1),
            color: c4rColors.accent.dark,
            '& .MuiAlert-icon': {
              color: c4rColors.accent.main,
            },
          },
          standardWarning: {
            backgroundColor: alpha(c4rColors.secondary.main, 0.1),
            color: c4rColors.secondary.dark,
            '& .MuiAlert-icon': {
              color: c4rColors.secondary.main,
            },
          },
          standardInfo: {
            backgroundColor: alpha(baseTheme.palette.info.main, 0.1),
            color: baseTheme.palette.info.dark,
          },
        },
      },

      // Enhanced Chip
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
          filled: {
            '&.MuiChip-colorPrimary': {
              backgroundColor: c4rColors.primary.main,
              color: c4rColors.primary.contrastText,
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: c4rColors.secondary.main,
              color: c4rColors.secondary.contrastText,
            },
          },
        },
      },

      // Enhanced Tab styling
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: c4rColors.primary.main,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            '&.Mui-selected': {
              color: c4rColors.primary.main,
            },
          },
        },
      },

      // Tooltip enhancements
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: c4rColors.gray[800],
            fontSize: '0.75rem',
            borderRadius: 6,
            padding: '8px 12px',
          },
          arrow: {
            color: c4rColors.gray[800],
          },
        },
      },
    },
  });
};

export { createC4RTheme, c4rColors };
export default createC4RTheme();