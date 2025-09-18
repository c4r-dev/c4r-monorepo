'use client';

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Help as HelpIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface C4RActivityLayoutProps {
  /** Activity title */
  title: string;
  /** Main content */
  children: React.ReactNode;
  /** Help content for modal */
  helpContent?: React.ReactNode;
  /** Whether to show home button */
  showHome?: boolean;
  /** Whether to show refresh button */
  showRefresh?: boolean;
  /** Custom actions in header */
  headerActions?: React.ReactNode;
  /** Whether to use container or full width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Background variant */
  background?: 'default' | 'gray' | 'gradient';
  /** Callback for help button */
  onHelp?: () => void;
  /** Callback for home button */
  onHome?: () => void;
  /** Callback for refresh button */
  onRefresh?: () => void;
}

/**
 * C4R Activity Layout
 * 
 * Standardized layout for all C4R activities with consistent header,
 * navigation, and content structure.
 * 
 * Features:
 * - Consistent C4R branding
 * - Built-in help system
 * - Responsive design
 * - Activity navigation
 * - Background variants
 * 
 * @example
 * ```tsx
 * <C4RActivityLayout
 *   title="Randomization Activity"
 *   helpContent={<div>Instructions here...</div>}
 *   showHome
 *   showRefresh
 *   maxWidth="lg"
 * >
 *   <YourActivityContent />
 * </C4RActivityLayout>
 * ```
 */
export default function C4RActivityLayout({
  title,
  children,
  helpContent,
  showHome = true,
  showRefresh = true,
  headerActions,
  maxWidth = 'lg',
  background = 'default',
  onHelp,
  onHome,
  onRefresh,
}: C4RActivityLayoutProps) {
  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const backgroundStyles = {
    default: {
      bgcolor: 'background.default',
    },
    gray: {
      bgcolor: 'grey.50',
    },
    gradient: {
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    },
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      ...backgroundStyles[background],
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={1}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left side - Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showHome && (
              <Tooltip title="Home">
                <IconButton
                  onClick={handleHome}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {showRefresh && (
              <Tooltip title="Refresh Activity">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Center - Title */}
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              color: 'text.primary',
              textAlign: 'center',
              flex: 1,
              mx: 2,
            }}
          >
            {title}
          </Typography>

          {/* Right side - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {headerActions}
            
            {helpContent && (
              <Tooltip title="Help & Instructions">
                <IconButton
                  onClick={onHelp}
                  size="small"
                  sx={{ 
                    color: 'primary.main',
                    bgcolor: alpha => alpha('primary.main', 0.1),
                    '&:hover': {
                      bgcolor: alpha => alpha('primary.main', 0.2),
                    },
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        {maxWidth ? (
          <Container maxWidth={maxWidth}>
            {children}
          </Container>
        ) : (
          <Box sx={{ px: 2 }}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}