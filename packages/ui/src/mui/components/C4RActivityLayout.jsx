'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Modal,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Help,
  Home,
  Refresh,
  Close,
} from '@mui/icons-material';

/**
 * @typedef {Object} C4RActivityLayoutProps
 * @property {string} title - Activity title
 * @property {React.ReactNode} children - Main content
 * @property {React.ReactNode} helpContent - Help content for modal
 * @property {boolean} showHome - Whether to show home button
 * @property {boolean} showRefresh - Whether to show refresh button
 * @property {React.ReactNode} headerActions - Custom actions in header
 * @property {string} maxWidth - Whether to use container or full width
 * @property {string} background - Background variant
 * @property {function} onHelp - Callback for help button
 * @property {function} onHome - Callback for home button
 * @property {function} onRefresh - Callback for refresh button
 */

/**
 * C4R Activity Layout
 * 
 * Standardized layout for all C4R activities with consistent header,
 * navigation, and content structure.
 * 
 * Features:
 * - C4R branded header with title
 * - Optional help modal
 * - Optional home/refresh navigation
 * - Responsive container
 * - Multiple background variants
 * 
 * @example
 * ```jsx
 * <C4RActivityLayout
 *   title="Randomization Activity"
 *   helpContent={<>Instructions here...</>}
 *   showHome
 *   showRefresh
 *   maxWidth="lg"
 * >
 *   <Typography>Activity content...</Typography>
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
}) {
  const [helpOpen, setHelpOpen] = useState(false);

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

  const handleHelp = () => {
    if (onHelp) {
      onHelp();
    } else {
      setHelpOpen(true);
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
    <Box sx={{ minHeight: '100vh', ...backgroundStyles[background] }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          {/* Left side - Navigation */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showHome && (
              <Tooltip title="Go to Home">
                <IconButton
                  color="inherit"
                  onClick={handleHome}
                  sx={{
                    color: 'primary.contrastText',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Home />
                </IconButton>
              </Tooltip>
            )}
            
            {showRefresh && (
              <Tooltip title="Refresh Activity">
                <IconButton
                  color="inherit"
                  onClick={handleRefresh}
                  sx={{
                    color: 'primary.contrastText',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Center - Title */}
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>

          {/* Right side - Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {headerActions}
            
            {helpContent && (
              <Tooltip title="Help & Instructions">
                <IconButton
                  color="inherit"
                  onClick={handleHelp}
                  sx={{
                    color: 'primary.contrastText',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Help />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={maxWidth} sx={{ py: 3 }}>
        {maxWidth === false ? (
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            {children}
          </Paper>
        )}
      </Container>

      {/* Help Modal */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography id="help-modal-title" variant="h6" component="h2">
                  Help & Instructions
                </Typography>
                <IconButton onClick={() => setHelpOpen(false)} size="small">
                  <Close />
                </IconButton>
              </Box>
              <Box id="help-modal-description">
                {helpContent}
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setHelpOpen(false)} variant="contained">
                Close
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
}