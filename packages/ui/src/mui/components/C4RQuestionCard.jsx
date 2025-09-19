'use client';
const logger = require('../../../../logging/logger.js');

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
  DragIndicator,
  Info,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';

/**
 * @typedef {Object} C4RQuestionCardProps
 * @property {*} /** Question text or content */
  question
 * @property {*} /** Question ID for tracking */
  id?
 * @property {*} /** Question category/type */
  category?
 * @property {*} /** Question source/origin */
  source?
 * @property {*} /** Whether question is selected */
  selected?
 * @property {*} /** Whether question is draggable */
  draggable?
 * @property {*} /** Whether to show info button */
  showInfo?
 * @property {*} /** Question status */
  status?
 * @property {*} /** Additional metadata to display */
  metadata?
 * @property {*} /** Card variant */
  variant?
 * @property {*} /** Color theme */
  theme?
 * @property {*} /** Actions to display */
  actions?
 * @property {*} /** Whether card is disabled */
  disabled?
 * @property {*} /** Click handler */
  onClick?
 * @property {*} /** Info button handler */
  onInfo?
 * @property {*} /** Drag start handler */
  onDragStart?
 * @property {*} /** Custom styling */
  sx?
 */

/**
 * C4R Question Card
 * 
 * Standardized card component for displaying questions, research items,
 * and interactive content across C4R activities.
 * 
 * Features="What is the effect of randomization on study validity?"
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
    primary,
      bg,
      selectedBg,
    },
    secondary, 
      bg,
      selectedBg,
    },
    accent,
      bg, 
      selectedBg,
    },
    neutral,
      bg,
      selectedBg,
    },
  };

  const statusColors = {
    pending,
    answered,
    skipped,
    correct,
    incorrect,
  };

  const statusIcons = {
    pending,
    answered="primary" />,
    skipped="warning" />,
    correct="success" />,
    incorrect="error" />,
  };

  const handleDragStart = (event) => {
    if (id) {
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.setData('application/json', JSON.stringify({
        id,
        question=== 'string' ? question,
        category,
        source,
      }));
    }
    onDragStart?.(event);
  };

  const CardComponent = variant === 'compact' ? Paper= themeColors[theme];

  return (
    
      {/* Drag Handle */}
      {draggable && (

      )}

      {/* Status Indicator */}
      {status !== 'pending' && (
        
          {statusIcons[status]}
        
      )}

        {/* Category & Source */}
        {(category || source) && (
          
            )}
            {source && (
              
        )}

        {/* Question Content */}
        
          {question}

        {/* Metadata */}
        {variant === 'detailed' && metadata && (
           (
              
                {key}: {String(value)}
              
            ))}
          
        )}

      {/* Actions */}
      {(actions || showInfo) && (
        
               {
                  e.stopPropagation();
                  onInfo?.();
                }}
              >

          )}
        
      )}
    
  );
}