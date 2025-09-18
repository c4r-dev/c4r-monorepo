const logger = require('../../../../../../packages/logging/logger.js');
// pages/index.js
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Modal,
  CircularProgress,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { useRouter } from 'next/router'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import CustomModal from '../components/CustomModal'
import SessionConfigPopup from '../components/SessionPopup/SessionConfigPopup'

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green color for cards
    },
    secondary: {
      main: '#E0E0E0', // Light gray for the concerns section
    },
  },
})

// Define the item type for DnD
const ItemTypes = {
  CARD: 'card',
}

// Function to get card description based on card text
const getCardDescription = (cardText) => {
  switch (cardText) {
    case 'Types of sterilization protocol':
      return 'Each step of the sterilization protocol could introduce factors that may impact neuronal development, such as cross-contamination or the introduction of an unknown growth factor.'
    case 'Incubation Procedure':
      return 'Minor procedural details like the temperature uniformity in the incubator could impact neuronal development.'
    case 'Culture Sourcing':
      return 'It is possible that cultures obtained from a particular species or anatomical region could respond differently from those obtained elsewhere. How would you handle the fact that the source of your culture could impact your results?'
    case 'Evaluation Timing':
      return 'Your cells might well grow more mature the more time they are afforded, and they may even grow at variable rates. If cell growth depends on cultivation period, how would you manage the timing of the evaluation step(s)?'
    case 'Neuroserpin Processing':
      return 'Depending on how the neuroserpin was processed & purified, there may be vehicle or recombinant protein artefacts that could have an effect on neuronal development.'
    case 'Neuron Selection':
      return 'Your cultures will feature many cells, not all of which will be viable for analysis, and it may not be feasible to measure the length of every single axon. Could the way you handle this impact your results?'
    default:
      return 'This card represents an important experimental consideration that requires careful planning and implementation to ensure valid results.'
  }
}

// Loading component
function Loading() {
  return (
    <Container
      maxWidth="md"
      sx={{ py: 8, display: 'flex', justifyContent: 'center' }}
    >
      <CircularProgress size={40} />
    </Container>
  )
}

// Help Modal Component
const HelpModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="help-modal-title"
      BackdropProps={{
        style: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: '#e5e5e5',
          borderRadius: '8px',
          p: 0,
          outline: 'none',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            id="help-modal-title"
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            How to Use This Application
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            This application helps you categorize experimental concerns into
            three approach categories:
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
            Instructions:
          </Typography>
          <Box component="ol" sx={{ pl: 3, mb: 3 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              Click on a card to learn more about each experimental concern
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              Drag and drop each card to one of the three approach bins:
              Constrain, Distribute, or Test
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              Each bin can hold multiple cards
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              After placing cards, you can drag them between bins to relocate them
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              Hover over placed cards to see their detailed explanations
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              You can optionally add implementation details for each card when
              prompted
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1 }}>
              Once all cards are placed, the submit button will be enabled
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
            Approaches:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Constrain:</strong> Limit variability and control
            experimental conditions tightly
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Distribute:</strong> Randomize and balance variables across
            experimental groups
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Test:</strong> Validate conditions through additional
            experiments or controls
          </Typography>
        </Box>

        {/* Buttons - matched to the card details popup style */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            bgcolor: '#d5d5d5',
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgb(98, 0, 238)',
              },
              py: 1.5,
              px: 3,
              borderRadius: '4px',
            }}
          >
            CLOSE
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

// Card Details Component with Bin Selection Dropdown
const CardDetailsPopup = ({
  open,
  card,
  onClose,
  onAssignToBin,
  placedCards,
}) => {
  const [selectedBin, setSelectedBin] = useState('constrain')

  if (!card) return null


  // Check if a bin is full (removed limit, always return false)
  const isBinFull = (binName) => {
    return false // Allow unlimited cards per bin
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="card-details-title"
      BackdropProps={{
        style: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: '#e5e5e5',
          borderRadius: '8px',
          p: 0,
          outline: 'none',
        }}
      >
        <Box sx={{ display: 'flex', p: 3 }}>
          {/* Card Image */}
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 120,
                height: 170,
                bgcolor: '#4CAF50',
                borderRadius: '8px',
                border: '2px solid #66BB6A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0px 0px 0px 2px #2196F3',
                position: 'relative',
              }}
            >
              {/* Dynamically display the card text in the popup image */}
              {card.text === 'Types of sterilization protocol' ? (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    Types of
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    sterilization
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    protocol
                  </Typography>
                </>
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  {card.text}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}
            >
              {card.text}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'black' }}>
              {getCardDescription(card.text)}
            </Typography>

            {/* Dropdown for bin selection */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}
              >
                Select a bin to assign this card:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Select
                  value={selectedBin}
                  onChange={(e) => setSelectedBin(e.target.value)}
                  displayEmpty
                  fullWidth
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: 'black',
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: '#999',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#666',
                    },
                  }}
                >
                  <MenuItem value="constrain" sx={{ color: 'black' }}>
                    Constrain{' '}
                    ({placedCards.constrain ? placedCards.constrain.length : 0} cards)
                  </MenuItem>
                  <MenuItem value="distribute" sx={{ color: 'black' }}>
                    Distribute{' '}
                    ({placedCards.distribute ? placedCards.distribute.length : 0} cards)
                  </MenuItem>
                  <MenuItem value="test" sx={{ color: 'black' }}>
                    Test{' '}
                    ({placedCards.test ? placedCards.test.length : 0} cards)
                  </MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: '#d5d5d5',
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgb(98, 0, 238)',
              },
              py: 1.5,
              px: 3,
              borderRadius: '4px',
            }}
          >
            RETURN TO LIST
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onAssignToBin(card.id, selectedBin)
              onClose()
            }}
disabled={false} // Allow assignment to any bin
            sx={{
              bgcolor: '#000000',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgb(98, 0, 238)',
              },
              py: 1.5,
              px: 3,
              borderRadius: '4px',
              '&.Mui-disabled': {
                bgcolor: '#999',
                color: '#ccc',
              },
            }}
          >
            ASSIGN TO BIN
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

// Implementation Popup Component
const ImplementationPopup = ({
  open,
  card,
  binName,
  onClose,
  onSkip,
  onSubmit,
  implementations,
}) => {
  const [implementation, setImplementation] = useState('')

  // Update implementation text when card changes or popup opens
  React.useEffect(() => {
    if (card && implementations[card.id]) {
      setImplementation(implementations[card.id])
    } else {
      setImplementation('')
    }
  }, [card, implementations])

  const handleSubmit = () => {
    onSubmit(implementation)
    setImplementation('')
  }

  const handleSkip = () => {
    onSkip()
    setImplementation('')
  }

  const isRelocation = card?.sourceBin

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
        {isRelocation 
          ? `Update your approach: Moving from ${card.sourceBin} to ${binName}`
          : 'How would you implement this approach for this concern?'
        }
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          value={implementation}
          onChange={(e) => setImplementation(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder={isRelocation 
            ? "Update your implementation details for this new approach..." 
            : "Add your implementation details here..."
          }
          sx={{
            mt: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={handleSkip}
          sx={{
            bgcolor: '#000000',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgb(98, 0, 238)',
            },
            py: 1,
            px: 3,
            borderRadius: '4px',
          }}
        >
          SKIP
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: '#000000',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgb(98, 0, 238)',
            },
            py: 1,
            px: 3,
            borderRadius: '4px',
          }}
        >
          SUBMIT
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Enhanced ConcernCard with drag logging
const ConcernCard = ({ id, text, onDrop, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: () => {
      logger.app.info(`🎬 DRAG STARTED: ${text}`)
      return { id, text }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  // Handle different text formats based on content
  const renderCardContent = () => {
    // Check if text contains a space to determine if it should be split
    if (text.includes(' ')) {
      const words = text.split(' ')

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {words.map((word, index) => (
            <Typography
              key={index}
              variant="subtitle2"
              sx={{ lineHeight: 1.2, fontWeight: 'bold' }}
            >
              {word}
            </Typography>
          ))}
        </Box>
      )
    }

    return (
      <Typography
        variant="subtitle2"
        align="center"
        sx={{ fontWeight: 'bold' }}
      >
        {text}
      </Typography>
    )
  }

  return (
    <Box
      ref={drag}
      onClick={() => onClick({ id, text })}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        mb: 2,
      }}
    >
      <Tooltip
        title={getCardDescription(text)}
        placement="top"
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              fontSize: '14px',
              maxWidth: '300px',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }
          },
          arrow: {
            sx: {
              color: 'rgba(0, 0, 0, 0.9)',
            }
          }
        }}
      >
        <Card
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: '150px',
            height: '80px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
            border: '2px solid black',
            padding: 0,
          }}
        >
          <CardContent
            sx={{
              padding: '8px !important',
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderCardContent()}
          </CardContent>
        </Card>
      </Tooltip>
    </Box>
  )
}

// Draggable static card component for placed cards in bins
const StaticCard = ({ id, text, currentBin, onMove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: () => {
      logger.app.info(`🎬 RELOCATE DRAG STARTED: ${text} from ${currentBin} bin`)
      return { id, text, isRelocation: true, sourceBin: currentBin }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  // Handle different text formats based on content
  const renderCardContent = () => {
    // Check if text contains a space to determine if it should be split
    if (text.includes(' ')) {
      const words = text.split(' ')

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {words.map((word, index) => (
            <Typography
              key={index}
              variant="subtitle2"
              sx={{ lineHeight: 1.2, fontWeight: 'bold' }}
            >
              {word}
            </Typography>
          ))}
        </Box>
      )
    }

    return (
      <Typography
        variant="subtitle2"
        align="center"
        sx={{ fontWeight: 'bold' }}
      >
        {text}
      </Typography>
    )
  }

  return (
    <Tooltip 
      title={getCardDescription(text)}
      placement="top"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            fontSize: '14px',
            maxWidth: '300px',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }
        },
        arrow: {
          sx: {
            color: 'rgba(0, 0, 0, 0.9)',
          }
        }
      }}
    >
      <Box 
        ref={drag}
        sx={{ 
          mb: 1,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
      >
        <Card
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: '150px',
            height: '80px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
            border: '2px solid black',
            padding: 0,
            '&:hover': {
              transform: 'scale(1.02)',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            },
          }}
        >
          <CardContent
            sx={{
              padding: '8px !important',
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderCardContent()}
          </CardContent>
        </Card>
      </Box>
    </Tooltip>
  )
}

// Drop target component - ENHANCED WITH RELOCATION SUPPORT
const DropTarget = ({ name, placedCards, onDrop, onRelocate }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    // Check for dark mode on mount
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDarkMode(e.matches)
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [])
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      logger.app.info(`🎯 DROP ATTEMPT: ${item.text} -> ${name} bin (currently ${placedCards.length} cards)`)
      
      // Check if this is a relocation (card moving between bins)
      if (item.isRelocation && item.sourceBin) {
        logger.app.info(`🔄 RELOCATION: Moving ${item.text} from ${item.sourceBin} to ${name}`)
        
        // Don't allow dropping in the same bin
        if (item.sourceBin === name) {
          logger.app.info(`⚠️ SAME BIN DROP: Ignoring drop in same bin`)
          return { dropped: false, name }
        }
        
        onRelocate(item.id, item.sourceBin, name)
        return { dropped: true, name, relocated: true }
      } else {
        // Regular card placement from concerns section
        logger.app.info(`✅ NEW PLACEMENT: Proceeding...`)
        onDrop(item.id, name)
        return { dropped: true, name }
      }
    },
    canDrop: (item, monitor) => {
      // For relocations, prevent dropping in the same bin
      if (item.isRelocation && item.sourceBin === name) {
        logger.app.info(`🔍 CAN DROP CHECK: ${item.text} -> ${name} = false (same bin)`)
        return false
      }
      
      logger.app.info(`🔍 CAN DROP CHECK: ${item.text} -> ${name} = true (${placedCards.length} cards)`)
      return true // Allow unlimited cards
    },
    hover: (item, monitor) => {
      // No hover restrictions for unlimited cards
    },
    collect: (monitor) => {
      const isOver = !!monitor.isOver()
      const canDrop = !!monitor.canDrop()
      
      if (isOver && !canDrop) {
        logger.app.info(`🔴 HOVERING OVER SAME BIN: ${name}`)
      }
      
      return { isOver, canDrop }
    },
  }), [placedCards.length, name, onDrop, onRelocate])

  return (
    <Box
      ref={drop}
      sx={{
        width: '150px',
        minHeight: '170px',
        // Removed maxHeight to allow expansion with more cards
        border: '3px dashed',
        borderColor: isOver ? '#4CAF50' : '#ccc',
        borderRadius: '10px',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: placedCards.length === 0 ? 'center' : 'flex-start',
        bgcolor: isOver ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
        transition: 'all 0.2s ease',
        // Removed pulsing animation as bins can hold unlimited cards
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
    >
      {placedCards.map((card) => (
        <StaticCard 
          key={card.id} 
          id={card.id}
          text={card.text} 
          currentBin={name}
          onMove={onRelocate}
        />
      ))}
      
      {placedCards.length === 0 && (
        <div
          style={{
            color: isDarkMode ? '#ffffff' : '#000000',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: isDarkMode ? '#333333' : 'transparent',
            padding: isDarkMode ? '8px 16px' : '0',
            borderRadius: isDarkMode ? '12px' : '0',
            border: isDarkMode ? '1px solid #666666' : 'none',
            textAlign: 'center'
          }}
        >
          Drag cards here
        </div>
      )}
      
      {/* Visual warning when hovering over full bin */}
      {/* {isOver && !canDrop && (
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ 
            mt: 1, 
            fontWeight: 'bold',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem'
          }}
        >
          ❌ CANNOT DROP
        </Typography>
      )} */}
    </Box>
  )
}

// Completion Message Component
const CompletionMessage = () => {
  return (
    <Box
      sx={{
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid black',
        borderRadius: '10px',
        backgroundColor: '#ccc',
        margin: '0 auto',
        padding: '20px',
        gap: '10px',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#4CAF50',
          textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
        }}
      >
        All done.
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#4CAF50',
          textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
        }}
      >
        Good job!
      </Typography>
    </Box>
  )
}

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Session and student identifiers
  const [sessionId, setSessionId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDarkMode(e.matches)
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [])

  // State for the implementation popup
  const [popupOpen, setPopupOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState(null)
  const [currentBin, setCurrentBin] = useState('')

  // State for card details popup
  const [cardDetailsOpen, setCardDetailsOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  // State to store implementations for each card
  const [implementations, setImplementations] = useState({})

  // State to track if all cards have been placed
  const [allCardsPlaced, setAllCardsPlaced] = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Initial state with all 6 cards and their locations
  const [cards, setCards] = useState([
    { id: 1, text: 'Types of sterilization protocol', visible: true, placed: false },
    { id: 2, text: 'Incubation Procedure', visible: true, placed: false },
    { id: 3, text: 'Culture Sourcing', visible: true, placed: false },
    { id: 4, text: 'Evaluation Timing', visible: true, placed: false },
    { id: 5, text: 'Neuroserpin Processing', visible: true, placed: false },
    { id: 6, text: 'Neuron Selection', visible: true, placed: false },
  ])

  // Separate state for cards placed in each bin
  const [placedCards, setPlacedCards] = useState({
    constrain: [],
    distribute: [],
    test: [],
  })

  // Initialize session and student IDs from URL parameters or local storage
  useEffect(() => {
    // Get session ID from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdParam = urlParams.get('sessionId')
    const studentIdParam = urlParams.get('studentId')

    // Set session ID from URL or use a default/stored value
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    } else {
      // You could generate a random session ID or get from localStorage
      const storedSessionId = localStorage.getItem('experimentSessionId')
      if (storedSessionId) {
        setSessionId(storedSessionId)
      } else {
        // Generate a random session ID if none exists
        const newSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`
        setSessionId(newSessionId)
        localStorage.setItem('experimentSessionId', newSessionId)
      }
    }

    // Set student ID from URL parameter if provided, otherwise leave empty
    // A unique student ID will be generated during submission
    if (studentIdParam) {
      setStudentId(studentIdParam)
    } else {
      // Student ID will be generated uniquely on each submission
      setStudentId('')
    }
  }, [])

  // Check if all cards are placed
  useEffect(() => {
    const placedCount =
      placedCards.constrain.length +
      placedCards.distribute.length +
      placedCards.test.length
    if (placedCount === 6) {
      setAllCardsPlaced(true)
    } else {
      setAllCardsPlaced(false)
    }
  }, [placedCards])

  // Handle card click to show details
  const handleCardClick = (card) => {
    setSelectedCard(card)
    setCardDetailsOpen(true)
  }

  // Handle assigning card to bin from details popup
  const handleAssignToBin = (cardId, binName) => {
    // Allow multiple cards per bin (removed limit check)

    // Close the details popup
    setCardDetailsOpen(false)

    // Initiate the drop process with the selected bin
    const droppedCard = cards.find((card) => card.id === cardId)
    if (droppedCard) {
      setCurrentCard(droppedCard)
      setCurrentBin(binName)
      setPopupOpen(true)
    }
  }

  // Handle dropping a card in a bin
  const handleDrop = (cardId, binName) => {
    logger.app.info(`Attempting to drop card ${cardId} in ${binName} bin`)
    logger.app.info(`Current bin contents:`, placedCards[binName])
    
    // Allow multiple cards per bin (removed limit check)

    // Find the card that was dropped
    const droppedCard = cards.find((card) => card.id === cardId)
    if (!droppedCard || droppedCard.placed) {
      logger.app.info(`Card not found or already placed`)
      return // Card not found or already placed
    }

    logger.app.info(`Proceeding with drop of card: ${droppedCard.text}`)

    // Save current card and bin for the popup
    setCurrentCard(droppedCard)
    setCurrentBin(binName)

    // Open the implementation popup
    setPopupOpen(true)
  }

  // Handle relocating a card between bins
  const handleRelocate = (cardId, sourceBin, targetBin) => {
    logger.app.info(`Relocating card ${cardId} from ${sourceBin} to ${targetBin}`)
    
    // Find the card in the source bin
    const cardToMove = placedCards[sourceBin].find(card => card.id === cardId)
    if (!cardToMove) {
      logger.app.error(`Card ${cardId} not found in ${sourceBin} bin`)
      return
    }

    // Set up for implementation popup (allow user to update their implementation)
    setCurrentCard(cardToMove)
    setCurrentBin(targetBin)
    
    // Store the source bin for the relocation
    setCurrentCard(prev => ({ ...prev, sourceBin: sourceBin }))
    
    // Open implementation popup to allow user to update their approach explanation
    setPopupOpen(true)
  }

  // Handle submitting implementation
  const handleImplementationSubmit = (implementation) => {
    // Save the implementation
    setImplementations((prev) => ({
      ...prev,
      [currentCard.id]: implementation,
    }))

    // Close the popup
    setPopupOpen(false)

    // Proceed with placing the card
    completeCardPlacement()
  }

  // Handle skipping implementation
  const handleImplementationSkip = () => {
    // Close the popup
    setPopupOpen(false)

    // Proceed with placing the card without saving implementation
    completeCardPlacement()
  }

  // Complete the card placement process
  const completeCardPlacement = () => {
    if (!currentCard || !currentBin) return

    // Check if this is a relocation (card already placed) vs new placement
    if (currentCard.sourceBin) {
      // This is a relocation - remove from source bin and add to target bin
      setPlacedCards((prev) => ({
        ...prev,
        [currentCard.sourceBin]: prev[currentCard.sourceBin].filter(card => card.id !== currentCard.id),
        [currentBin]: [...prev[currentBin], { ...currentCard, sourceBin: undefined }],
      }))
      
      logger.app.info(`Successfully relocated ${currentCard.text} from ${currentCard.sourceBin} to ${currentBin}`)
    } else {
      // This is a new placement from concerns section
      // Add the card to the bin
      setPlacedCards((prev) => ({
        ...prev,
        [currentBin]: [...prev[currentBin], currentCard],
      }))

      // Mark the card as placed and not visible in the concerns section
      setCards((prev) =>
        prev.map((card) =>
          card.id === currentCard.id
            ? { ...card, placed: true, visible: false }
            : card,
        ),
      )

      // Make the next hidden card visible if available
      const nextHiddenCard = cards.find((card) => !card.visible && !card.placed)
      if (nextHiddenCard) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === nextHiddenCard.id ? { ...card, visible: true } : card,
          ),
        )
      }
    }

    // Reset current card and bin
    setCurrentCard(null)
    setCurrentBin('')
  }

  // Handle help button click
  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  // Function to generate a unique student ID
  const generateUniqueStudentId = () => {
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 8)
    return `student_${timestamp}_${randomPart}`
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Generate a unique student ID for this submission
      const uniqueStudentId = generateUniqueStudentId()
      logger.app.info('Generated unique student ID:', uniqueStudentId)
      
      // Update the student ID state for reference
      setStudentId(uniqueStudentId)

      // Organize the data for submission
      const concernsData = []

      // Process each bin and the cards in it
      Object.entries(placedCards).forEach(([binName, cards]) => {
        cards.forEach((card) => {
          concernsData.push({
            concernname: card.text,
            binname: binName, // constrain, distribute, or test
            response: implementations[card.id] || '', // Get implementation or empty string if not provided
          })
        })
      })

      // Get session ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const urlSessionId = urlParams.get('sessionID') || sessionId

      // Determine session type based on the sessionId
      const sessionType = urlSessionId.includes('individual')
        ? 'individual'
        : 'group'

      // Create the payload with the unique student ID
      const payload = {
        sessionId: urlSessionId,
        studentId: uniqueStudentId,
        selectedSection: 2, // Using the numeric value as per your format
        sessionType: sessionType,
        concerns: concernsData,
      }

      logger.app.info('Submitting data:', payload)

      // Import the API utility function
      const { apiCall } = await import('../lib/api');
      
      // Send the data to the API
      const response = await apiCall('/api/concerns', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      logger.app.info('Response status:', response.status)
      logger.app.info('Response headers:', response.headers)

      let result
      try {
        const responseText = await response.text()
        logger.app.info('Raw response text:', responseText)
        
        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: 'Empty response from server' }
        }
      } catch (parseError) {
        logger.app.error('Failed to parse response as JSON:', parseError)
        result = { message: 'Invalid JSON response from server' }
      }

      if (response.ok) {
        // Success
        setSubmitSuccess(true)
        logger.app.info('Submission result:', result)

        // Navigate to results page with sessionId and unique studentId parameters
        window.location.href = `/Results?sessionId=${encodeURIComponent(
          urlSessionId,
        )}`
      } else {
        // Handle error
        setSubmitError(result.message || 'An error occurred during submission.')
        logger.app.error('Submission error:', result)
        alert(
          `Error: ${result.message || 'An error occurred during submission.'}`,
        )
      }
    } catch (error) {
      setSubmitError('Network error or server is not responding.')
      logger.app.error('Submission error:', error)
      alert(
        'An error occurred while submitting your responses. Please try again later.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cards to display in the concerns section
  const visibleCards = cards.filter((card) => card.visible && !card.placed)

  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ width: '100%', px: 2, pt: '80px' }}>
          <Container maxWidth="md">
            {/* Concerns Section */}
            <Paper
              elevation={1}
              sx={{
                p: 4,
                bgcolor: 'secondary.main',
                borderRadius: '10px',
                mb: 4,
                border: '1px solid black',
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold !important',
                  color: '#000000 !important',
                  backgroundColor: 'transparent !important',
                  textShadow: 'none !important',
                  WebkitTextFillColor: '#000000 !important',
                  filter: 'none !important',
                  opacity: '1 !important',
                  '&': {
                    color: '#000000 !important',
                    fontWeight: 'bold !important',
                    WebkitTextFillColor: '#000000 !important',
                  },
                  '& *': {
                    color: '#000000 !important',
                    WebkitTextFillColor: '#000000 !important',
                  },
                  '@media (prefers-color-scheme: dark)': {
                    color: '#000000 !important',
                    fontWeight: 'bold !important',
                    WebkitTextFillColor: '#000000 !important',
                  }
                }}
              >
                Concerns to be Addressed
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Click on a card to learn more about it, then drag each to the
                stack below that represents the approach you think would most
                suitably address the concern in question. Once placed, you can
                drag cards between bins to relocate them.
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                This exercise isn&apos;t about right or wrong answers, it&apos;s
                about exploring your own reasoning.
              </Typography>

              {allCardsPlaced ? (
                <CompletionMessage />
              ) : (
                <Grid container spacing={2} justifyContent="center">
                  {visibleCards.map((card) => (
                    <Grid item key={card.id}>
                      <ConcernCard
                        id={card.id}
                        text={card.text}
                        onDrop={handleDrop}
                        onClick={handleCardClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {/* Drop Targets */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  title="Decrease a variable's influence by limiting its range."
                  placement="top"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        fontSize: '14px',
                        maxWidth: '300px',
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }
                    },
                    arrow: {
                      sx: {
                        color: 'rgba(0, 0, 0, 0.9)',
                      }
                    }
                  }}
                >
                  <div
                    style={{
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      backgroundColor: isDarkMode ? '#000000' : 'transparent',
                      padding: isDarkMode ? '8px 16px' : '0',
                      borderRadius: isDarkMode ? '12px' : '0',
                      border: isDarkMode ? '2px solid #ffffff' : 'none',
                      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      cursor: 'help'
                    }}
                  >
                    Constrain
                  </div>
                </Tooltip>
                <DropTarget
                  name="constrain"
                  placedCards={placedCards.constrain}
                  onDrop={handleDrop}
                  onRelocate={handleRelocate}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  title="Decrease a variable's influence by making it as equal as possible across groups."
                  placement="top"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        fontSize: '14px',
                        maxWidth: '300px',
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }
                    },
                    arrow: {
                      sx: {
                        color: 'rgba(0, 0, 0, 0.9)',
                      }
                    }
                  }}
                >
                  <div
                    style={{
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      backgroundColor: isDarkMode ? '#000000' : 'transparent',
                      padding: isDarkMode ? '8px 16px' : '0',
                      borderRadius: isDarkMode ? '12px' : '0',
                      border: isDarkMode ? '2px solid #ffffff' : 'none',
                      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      cursor: 'help'
                    }}
                  >
                    Distribute
                  </div>
                </Tooltip>
                <DropTarget
                  name="distribute"
                  placedCards={placedCards.distribute}
                  onDrop={handleDrop}
                  onRelocate={handleRelocate}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  title="Use the variable to make comparison groups or adjust for effect during analysis."
                  placement="top"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        fontSize: '14px',
                        maxWidth: '300px',
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }
                    },
                    arrow: {
                      sx: {
                        color: 'rgba(0, 0, 0, 0.9)',
                      }
                    }
                  }}
                >
                  <div
                    style={{
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      backgroundColor: isDarkMode ? '#000000' : 'transparent',
                      padding: isDarkMode ? '8px 16px' : '0',
                      borderRadius: isDarkMode ? '12px' : '0',
                      border: isDarkMode ? '2px solid #ffffff' : 'none',
                      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      cursor: 'help'
                    }}
                  >
                    Test
                  </div>
                </Tooltip>
                <DropTarget
                  name="test"
                  placedCards={placedCards.test}
                  onDrop={handleDrop}
                  onRelocate={handleRelocate}
                />
              </Grid>
            </Grid>

            {/* Footer with buttons */}
            <Box
              sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!allCardsPlaced || isSubmitting}
                sx={{
                  bgcolor: '#000000 !important',
                  color: 'white !important',
                  border: '1px solid #333 !important',
                  '&:hover': {
                    bgcolor: 'rgb(98, 0, 238) !important',
                  },
                  '&:disabled': {
                    bgcolor: '#d3d3d3 !important',
                    color: '#999 !important',
                    border: '1px solid #d3d3d3 !important',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3) !important',
                }}
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            </Box>

            {/* Error message */}
            {submitError && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: '#ffebee',
                  color: '#d32f2f',
                  borderRadius: '4px',
                  mb: 2,
                }}
              >
                <Typography variant="body2">{submitError}</Typography>
              </Paper>
            )}

            {/* Success message */}
            {submitSuccess && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '4px',
                  mb: 2,
                }}
              >
                <Typography variant="body2">
                  Your responses have been submitted successfully!
                </Typography>
              </Paper>
            )}
          </Container>
        </Box>

        {/* Implementation Popup */}
        <ImplementationPopup
          open={popupOpen}
          card={currentCard}
          binName={currentBin}
          implementations={implementations}
          onClose={() => setPopupOpen(false)}
          onSkip={handleImplementationSkip}
          onSubmit={handleImplementationSubmit}
        />

        {/* Card Details Popup */}
        <CardDetailsPopup
          open={cardDetailsOpen}
          card={selectedCard}
          placedCards={placedCards}
          onClose={() => setCardDetailsOpen(false)}
          onAssignToBin={handleAssignToBin}
        />

        {/* Help Modal */}
        <CustomModal isOpen={isModalOpen} closeModal={closeModal} />
      </DndProvider>
    </ThemeProvider>
  )
}

export default function HomeScreen() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  )
}