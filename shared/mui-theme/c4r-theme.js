import { createTheme } from '@mui/material/styles';

/**
 * C4R Material-UI Theme
 * Integrates with the C4R design system and Tailwind configuration
 */

const c4rTheme = createTheme({
  palette: {
    mode: 'light',
    
    // C4R Brand Colors (matches Tailwind config)
    primary: {
      main: '#6E00FF',        // c4r-primary
      dark: '#5700CA',        // c4r-primary-dark
      light: '#8A33FF',       // Lighter purple
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF5A00',        // c4r-secondary (orange)
      dark: '#E64A00',        // Darker orange
      light: '#FF7733',       // Lighter orange  
      contrastText: '#ffffff',
    },
    
    // Semantic Colors
    success: {
      main: '#00C802',        // c4r-accent (green)
      dark: '#00A002',        // Darker green
      light: '#33D435',       // Lighter green
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f47321',        // c4r-secondary-alt
      dark: '#E55A00',        // Darker orange
      light: '#FF9554',       // Lighter orange
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',        // Red-500 from Tailwind
      dark: '#DC2626',        // Red-600
      light: '#F87171',       // Red-400
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',        // Blue-500 from Tailwind
      dark: '#2563EB',        // Blue-600
      light: '#60A5FA',       // Blue-400
      contrastText: '#ffffff',
    },

    // Gray scale (matches Tailwind config)
    grey: {
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

    // Background colors
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    
    // Text colors
    text: {
      primary: '#111827',     // Gray-900
      secondary: '#6b7280',   // Gray-500  
      disabled: '#9ca3af',    // Gray-400
    },
  },

  // Typography system (matches your 7-size font restriction)
  typography: {
    fontFamily: [
      'General Sans',
      'GeneralSans-Regular', 
      'Arial',
      'Helvetica',
      'sans-serif'
    ].join(','),
    
    // Custom typography variants matching Tailwind config
    h1: {
      fontSize: '2rem',       // text-3xl (32px) - Page titles
      fontWeight: 700,
      fontFamily: 'GeneralSans-Semibold, General Sans, sans-serif',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',     // text-2xl (24px) - Section headers  
      fontWeight: 600,
      fontFamily: 'GeneralSans-Semibold, General Sans, sans-serif',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',    // text-xl (20px) - Subheadings
      fontWeight: 600,
      fontFamily: 'GeneralSans-Medium, General Sans, sans-serif',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',   // text-lg (18px) - Large body text
      fontWeight: 500,
      fontFamily: 'GeneralSans-Medium, General Sans, sans-serif',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',       // text-base (16px) - Primary body text
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',   // text-sm (14px) - Small body text
      fontWeight: 400,
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.75rem',    // text-xs (12px) - Small text, captions
      fontWeight: 400,
      lineHeight: 1.3,
    },
    button: {
      fontSize: '0.875rem',   // text-sm (14px)
      fontWeight: 500,
      textTransform: 'none',  // Prevent uppercase transformation
    },
    
    // Remove unused typography variants to enforce 7-size system
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    overline: undefined,
  },

  // Component customizations
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',    // Tailwind rounded-md
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',        // py-2 px-4
          fontSize: '0.875rem',       // text-sm
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
      variants: [
        // C4R button variants
        {
          props: { variant: 'c4r-primary' },
          style: {
            backgroundColor: '#6E00FF',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#5700CA',
            },
          },
        },
        {
          props: { variant: 'c4r-secondary' },
          style: {
            backgroundColor: '#FF5A00',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#E64A00',
            },
          },
        },
        {
          props: { variant: 'c4r-accent' },
          style: {
            backgroundColor: '#00C802',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#00A002',
            },
          },
        },
      ],
    },

    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',      // Tailwind rounded-lg
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb', // border-gray-200
        },
      },
    },

    // TextField customizations  
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem',  // Tailwind rounded-md
            '&.Mui-focused fieldset': {
              borderColor: '#6E00FF',  // C4R primary
              borderWidth: '2px',
            },
          },
        },
      },
    },

    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',      // Tailwind rounded-lg
        },
      },
    },

    // Dialog customizations
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',      // Tailwind rounded-lg
        },
      },
    },

    // Alert customizations
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',    // Tailwind rounded-md
        },
      },
    },
  },

  // Spacing system (matches Tailwind)
  spacing: 4, // 4px base unit (matches Tailwind's 1 = 0.25rem)

  // Shape (border radius)
  shape: {
    borderRadius: 6, // 6px default (0.375rem = rounded-md in Tailwind)
  },
});

export default c4rTheme;