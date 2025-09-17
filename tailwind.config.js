/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./activities/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./templates/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      fontFamily: {
        'sans': ['General Sans', 'GeneralSans-Regular', 'Arial', 'Helvetica', 'sans-serif'],
        'sans-medium': ['GeneralSans-Medium', 'General Sans', 'sans-serif'],
        'sans-semibold': ['GeneralSans-Semibold', 'General Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // ONLY these 7 sizes are allowed - no other font sizes should be used
        'xs': '0.75rem',    // 12px - Small text, captions
        'sm': '0.875rem',   // 14px - Small body text  
        'base': '1rem',     // 16px - Primary body text (default)
        'lg': '1.125rem',   // 18px - Large body text
        'xl': '1.25rem',    // 20px - Subheadings
        '2xl': '1.5rem',    // 24px - Section headers
        '3xl': '2rem',      // 32px - Page titles
        // All other Tailwind font sizes are disabled
      },
      colors: {
        // Brand Colors (from your codebase analysis)
        'brand': {
          'primary': '#6E00FF',      // Your purple brand color
          'primary-hover': '#6200E4', // Darker purple for hover
          'primary-disabled': '#5e00da', // Disabled purple
        },
        
        // Semantic Colors
        'primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        'success': {
          DEFAULT: '#4CAF50',        // Green
          light: '#28a745',
          background: '#e8f5e8',
          foreground: '#2d5a3d',
        },
        'warning': {
          DEFAULT: '#f39c12',        // Orange
          light: '#ffd93d',
        },
        'error': {
          DEFAULT: '#e74c3c',        // Red
          light: '#ff6b6b',
          dark: '#d32f2f',
          background: '#ffebee',
          foreground: '#721c24',
        },
        'info': {
          DEFAULT: '#3498db',        // Blue
          light: '#74b9ff',
          dark: '#2980b9',
        },
        
        // Gray Scale (from your usage)
        'gray': {
          50: '#f9f9f9',
          100: '#f5f5f5',
          200: '#e0e0e0',
          300: '#d4d4d4',
          400: '#a9a9a9',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Custom Colors (from your codebase)
        'custom': {
          'dark-bg': '#333132',       // Used in DragAndDropGame
          'black-bg': '#060606',      // Used in DragAndDropGame
          'card-bg': '#f4f7f6',
          'content-bg': '#ffffff',
          'section-bg': '#f0f0f0',
          'item-bg': '#e9e9e9',
          'system-added': '#c5aaf1',
          'inspiration': '#e0e7ff',
          'team-a': '#3cb878',       // Team A Green
          'team-b': '#4a86e8',       // Team B Blue
          'manuscript': '#2a8f5d',   // Darker Green for manuscript
        },
        
        // UI Element Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    },
  },
  plugins: [],
}