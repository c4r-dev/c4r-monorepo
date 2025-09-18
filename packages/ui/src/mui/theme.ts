import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * C4R Material-UI Theme
 * 
 * Integrates with the C4R design system and Tailwind configuration.
 * Enforces the 7-size font system and C4R brand colors across all MUI components.
 */

declare module '@mui/material/styles' {
  interface Palette {
    c4r: {
      primary: string;
      primaryDark: string;
      secondary: string;
      secondaryAlt: string;
      accent: string;
      accentAlt: string;
    };
  }
  
  interface PaletteOptions {
    c4r?: {
      primary?: string;
      primaryDark?: string;
      secondary?: string;
      secondaryAlt?: string;
      accent?: string;
      accentAlt?: string;
    };
  }

  // Add C4R button variants
  interface ComponentNameToClassKey {
    MuiButton: 'c4rPrimary' | 'c4rSecondary' | 'c4rAccent';
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    c4rPrimary: true;
    c4rSecondary: true;
    c4rAccent: true;
  }
}

const c4rTheme = createTheme({
  palette: {
    mode: 'light',
    
    // C4R Brand Colors (matches Tailwind config)
    primary: {
      main: '#6E00FF',        // c4r-primary
      dark: '#5700CA',        // c4r-primary-dark
      light: '#8A33FF',       // Lighter purple for contrast
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF5A00',        // c4r-secondary (orange)
      dark: '#E64A00',        // Darker orange
      light: '#FF7733',       // Lighter orange  
      contrastText: '#ffffff',
    },
    
    // C4R Extended Palette
    c4r: {
      primary: '#6E00FF',
      primaryDark: '#5700CA',
      secondary: '#FF5A00',
      secondaryAlt: '#f47321',
      accent: '#00C802',
      accentAlt: '#4CAF50',
    },
    
    // Semantic Colors (using C4R accent colors)
    success: {
      main: '#00C802',        // c4r-accent (green)
      dark: '#00A002',
      light: '#33D435',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f47321',        // c4r-secondary-alt
      dark: '#E55A00',
      light: '#FF9554',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',        // Tailwind red-500
      dark: '#DC2626',
      light: '#F87171',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',        // Tailwind blue-500
      dark: '#2563EB',
      light: '#60A5FA',
      contrastText: '#ffffff',
    },

    // Gray scale (matches Tailwind config exactly)
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

    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    
    text: {
      primary: '#111827',     // gray-900
      secondary: '#6b7280',   // gray-500  
      disabled: '#9ca3af',    // gray-400
    },
  },

  // Typography system (enforces 7-size font restriction)
  typography: {
    fontFamily: [
      'General Sans',
      'GeneralSans-Regular', 
      'Arial',
      'Helvetica',
      'sans-serif'
    ].join(','),
    
    // Map MUI variants to C4R 7-size system
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
      fontSize: '0.875rem',   // text-sm
      fontWeight: 500,
      textTransform: 'none',
    },
    
    // Remove unused variants (enforces 7-size system)
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    overline: undefined,
  },

  // Component customizations
  components: {
    // Button variants with C4R colors
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',    // rounded-md
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',       // text-sm
          padding: '8px 16px',        // py-2 px-4
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'c4rPrimary' },
          style: {
            backgroundColor: '#6E00FF',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#5700CA',
            },
            '&:disabled': {
              backgroundColor: '#5e00da',
              color: '#ffffff',
              opacity: 0.6,
            },
          },
        },
        {
          props: { variant: 'c4rSecondary' },
          style: {
            backgroundColor: '#FF5A00',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#E64A00',
            },
          },
        },
        {
          props: { variant: 'c4rAccent' },
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

    // Enhanced Card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',      // rounded-lg
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb', // border-gray-200
        },
      },
    },

    // TextField with C4R focus colors  
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem',  // rounded-md
            '&.Mui-focused fieldset': {
              borderColor: '#6E00FF',  // C4R primary
              borderWidth: '2px',
            },
          },
        },
      },
    },

    // Dialog styling
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',      // rounded-lg
          padding: '1.5rem',
        },
      },
    },

    // Alert styling
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',    // rounded-md
        },
      },
    },

    // Typography enforces font restrictions
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'General Sans, Arial, Helvetica, sans-serif',
        },
      },
    },
  },

  spacing: 4, // 4px base unit (matches Tailwind)
  shape: {
    borderRadius: 6, // 6px default
  },
});

export type C4RThemeType = typeof c4rTheme;
export default c4rTheme;