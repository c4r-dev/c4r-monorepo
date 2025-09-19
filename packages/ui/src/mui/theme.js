import { createTheme } from '@mui/material/styles';
/**
 * C4R Material-UI Theme
 * 
 * Integrates with the C4R design system and Tailwind configuration.
 * Enforces the 7-size font system and C4R brand colors across all MUI components.
 */

module '@mui/material/styles' {
  /**
 * @typedef {Object} Palette
 * @property {*} c4r
 * @property {*} primaryDark
 * @property {*} secondary
 * @property {*} secondaryAlt
 * @property {*} accent
 * @property {*} accentAlt
 */;
  }
  
  /**
 * @typedef {Object} PaletteOptions
 * @property {*} c4r?
 * @property {*} primaryDark?
 * @property {*} secondary?
 * @property {*} secondaryAlt?
 * @property {*} accent?
 * @property {*} accentAlt?
 */;
  }

  // Add C4R button variants
  /**
 * @typedef {Object} ComponentNameToClassKey
 * @property {*} MuiButton
 */
}

module '@mui/material/Button' {
  /**
 * @typedef {Object} ButtonPropsVariantOverrides
 * @property {*} c4rPrimary
 * @property {*} c4rSecondary
 * @property {*} c4rAccent
 */
}

const c4rTheme = createTheme({
  palette,
    
    // C4R Brand Colors (matches Tailwind config)
    primary,        // c4r-primary
      dark,        // c4r-primary-dark
      light,       // Lighter purple for contrast
      contrastText,
    },
    secondary,        // c4r-secondary (orange)
      dark,        // Darker orange
      light,       // Lighter orange  
      contrastText,
    },
    
    // C4R Extended Palette
    c4r,
      primaryDark,
      secondary,
      secondaryAlt,
      accent,
      accentAlt,
    },
    
    // Semantic Colors (using C4R accent colors)
    success,        // c4r-accent (green)
      dark,
      light,
      contrastText,
    },
    warning,        // c4r-secondary-alt
      dark,
      light,
      contrastText,
    },
    error,        // Tailwind red-500
      dark,
      light,
      contrastText,
    },
    info,        // Tailwind blue-500
      dark,
      light,
      contrastText,
    },

    // Gray scale (matches Tailwind config exactly)
    grey,
      100,
      200,
      300,
      400,
      500,
      600,
      700,
      800,
      900,
    },

    background,
      paper,
    },
    
    text,     // gray-900
      secondary,   // gray-500  
      disabled,    // gray-400
    },
  },

  // Typography system (enforces 7-size font restriction)
  typography,
      'GeneralSans-Regular', 
      'Arial',
      'Helvetica',
      'sans-serif'
    ].join(','),
    
    // Map MUI variants to C4R 7-size system
    h1,       // text-3xl (32px) - Page titles
      fontWeight,
      fontFamily, General Sans, sans-serif',
      lineHeight,
    },
    h2,     // text-2xl (24px) - Section headers  
      fontWeight,
      fontFamily, General Sans, sans-serif',
      lineHeight,
    },
    h3,    // text-xl (20px) - Subheadings
      fontWeight,
      fontFamily, General Sans, sans-serif',
      lineHeight,
    },
    h4,   // text-lg (18px) - Large body text
      fontWeight,
      fontFamily, General Sans, sans-serif',
      lineHeight,
    },
    body1,       // text-base (16px) - Primary body text
      fontWeight,
      lineHeight,
    },
    body2,   // text-sm (14px) - Small body text
      fontWeight,
      lineHeight,
    },
    caption,    // text-xs (12px) - Small text, captions
      fontWeight,
      lineHeight,
    },
    button,   // text-sm
      fontWeight,
      textTransform,
    },
    
    // Remove unused variants (enforces 7-size system)
    h5,
    h6,
    subtitle1,
    subtitle2,
    overline,
  },

  // Component customizations
  components,    // rounded-md
          textTransform,
          fontWeight,
          fontSize,       // text-sm
          padding,        // py-2 px-4
          transition,
        },
        contained)',
          '&:hover': {
            boxShadow)',
          },
        },
      },
      variants,
          style,
            color,
            '&:hover': {
              backgroundColor,
            },
            '&:disabled': {
              backgroundColor,
              color,
              opacity,
            },
          },
        },
        {
          props,
          style,
            color,
            '&:hover': {
              backgroundColor,
            },
          },
        },
        {
          props,
          style,
            color,
            '&:hover': {
              backgroundColor,
            },
          },
        },
      ],
    },

    // Enhanced Card styling
    MuiCard,      // rounded-lg
          boxShadow), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border, // border-gray-200
        },
      },
    },

    // TextField with C4R focus colors  
    MuiTextField,  // rounded-md
            '&.Mui-focused fieldset': {
              borderColor,  // C4R primary
              borderWidth,
            },
          },
        },
      },
    },

    // Dialog styling
    MuiDialog,      // rounded-lg
          padding,
        },
      },
    },

    // Alert styling
    MuiAlert,    // rounded-md
        },
      },
    },

    // Typography enforces font restrictions
    MuiTypography, Arial, Helvetica, sans-serif',
        },
      },
    },
  },

  spacing, // 4px base unit (matches Tailwind)
  shape, // 6px default
  },
});

export type C4RThemeType = typeof c4rTheme;
export default c4rTheme;