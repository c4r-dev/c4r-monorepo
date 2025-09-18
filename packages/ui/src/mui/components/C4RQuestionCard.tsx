const logger = require('../../../../logging/logger.js');
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';

interface C4RQuestionCardProps {
  /** Question text or content */
  question: React.ReactNode;
  /** Question ID for tracking */
  id?: string;
  /** Question category/type */
  category?: string;
  /** Question source/origin */
  source?: string;
  /** Whether question is selected */
  selected?: boolean;
  /** Whether question is draggable */
  draggable?: boolean;
  /** Whether to show info button */
  showInfo?: boolean;
  /** Question status */
  status?: 'pending' | 'answered' | 'skipped' | 'correct' | 'incorrect';
  /** Additional metadata to display */
  metadata?: Record<string, any>;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Color theme */
  theme?: 'primary' | 'secondary' | 'accent' | 'neutral';
  /** Actions to display */
  actions?: React.ReactNode;
  /** Whether card is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Info button handler */
  onInfo?: () => void;
  /** Drag start handler */
  onDragStart?: (event: React.DragEvent) => void;
  /** Custom styling */
  sx?: any;
}

/**
 * C4R Question Card
 * 
 * Standardized card component for displaying questions, research items,
 * and interactive content across C4R activities.
 * 
 * Features:
 * - Multiple variants and themes
 * - Drag and drop support
 * - Selection states
 * - Status indicators
 * - Metadata display
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <C4RQuestionCard
 *   question="What is the effect of randomization on study validity?"
 *   category="Methodology"
 *   source="Research Paper #1"
 *   status="pending"
 *   draggable
 *   showInfo
 *   onClick={() => logger.app.info('Question clicked')}
 *   onInfo={() => showQuestionDetails()}
 * />
 * ```
 */
export default function C4RQuestionCard({
  question,
  id,
  category,
  source,
  selected = false,
  draggable = false,
  showInfo = false,
  status = 'pending',
  metadata,
  variant = 'default',
  theme = 'neutral',
  actions,
  disabled = false,
  onClick,
  onInfo,
  onDragStart,
  sx,
}: C4RQuestionCardProps) {
  const themeColors = {
    primary: {
      border: 'primary.main',
      bg: 'primary.50',
      selectedBg: 'primary.100',
    },
    secondary: {
      border: 'secondary.main', 
      bg: 'warning.50',
      selectedBg: 'warning.100',
    },
    accent: {
      border: 'success.main',
      bg: 'success.50', 
      selectedBg: 'success.100',
    },
    neutral: {
      border: 'grey.300',
      bg: 'background.paper',
      selectedBg: 'grey.100',
    },
  };

  const statusColors = {
    pending: 'default',
    answered: 'primary',
    skipped: 'warning',
    correct: 'success',
    incorrect: 'error',
  } as const;

  const statusIcons = {
    pending: <UncheckedIcon />,
    answered: <CheckIcon color="primary" />,
    skipped: <UncheckedIcon color="warning" />,
    correct: <CheckIcon color="success" />,
    incorrect: <CheckIcon color="error" />,
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (id) {
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.setData('application/json', JSON.stringify({
        id,
        question: typeof question === 'string' ? question : 'Complex question',
        category,
        source,
      }));
    }
    onDragStart?.(event);
  };

  const CardComponent = variant === 'compact' ? Paper : Card;
  const currentTheme = themeColors[theme];

  return (
    <CardComponent
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={!disabled ? onClick : undefined}
      elevation={variant === 'compact' ? 1 : 2}
      sx={{
        cursor: onClick && !disabled ? 'pointer' : draggable ? 'grab' : 'default',
        border: 2,
        borderColor: selected ? currentTheme.border : 'transparent',
        bgcolor: selected ? currentTheme.selectedBg : currentTheme.bg,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
        '&:hover': !disabled ? {
          borderColor: currentTheme.border,
          transform: draggable ? 'scale(1.02)' : 'translateY(-1px)',
          boxShadow: 3,
        } : {},
        '&:active': draggable ? {
          cursor: 'grabbing',
          transform: 'scale(0.98)',
        } : {},
        ...sx,
      }}
    >
      {/* Drag Handle */}
      {draggable && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            color: 'text.secondary',
            cursor: 'grab',
          }}
        >
          <DragIcon fontSize="small" />
        </Box>
      )}

      {/* Status Indicator */}
      {status !== 'pending' && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: `${statusColors[status]}.main`,
          }}
        >
          {statusIcons[status]}
        </Box>
      )}

      <CardContent sx={{ 
        pt: draggable || status !== 'pending' ? 5 : 2,
        pb: variant === 'compact' ? 2 : undefined,
      }}>
        {/* Category & Source */}
        {(category || source) && (
          <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {category && (
              <Chip 
                label={category} 
                size="small" 
                color={theme === 'neutral' ? 'primary' : theme as any}
                variant="outlined"
              />
            )}
            {source && (
              <Chip 
                label={source} 
                size="small" 
                variant="filled"
                sx={{ bgcolor: 'grey.100', color: 'text.secondary' }}
              />
            )}
          </Box>
        )}

        {/* Question Content */}
        <Typography 
          variant={variant === 'compact' ? 'body2' : 'body1'}
          component="div"
          sx={{ 
            mb: variant === 'detailed' ? 2 : 1,
            lineHeight: 1.5,
          }}
        >
          {question}
        </Typography>

        {/* Metadata */}
        {variant === 'detailed' && metadata && (
          <Box sx={{ mt: 2 }}>
            {Object.entries(metadata).map(([key, value]) => (
              <Typography 
                key={key} 
                variant="caption" 
                display="block"
                color="text.secondary"
              >
                <strong>{key}:</strong> {String(value)}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      {(actions || showInfo) && (
        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
          
          {showInfo && (
            <Tooltip title="More Information">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onInfo?.();
                }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      )}
    </CardComponent>
  );
}