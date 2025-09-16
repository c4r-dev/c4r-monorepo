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
  Tooltip,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import CustomModal from './components/CustomModal'
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup'

// Function to get card description based on card text
const getCardDescription = (cardText) => {
  switch (cardText) {
    case 'Sterilization Protocol':
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

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green color for cards
    },
    secondary: {
      main: '#E0E0E0', // Light gray for the concerns section
    },
    text: {
      primary: '#000000', // Force black text
      secondary: '#000000', // Force black text for secondary text too
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.force-dark-header': {
            color: '#000000 !important',
            fontWeight: 'bold !important',
            opacity: '1 !important',
            textShadow: '2px 2px 4px rgba(255,255,255,1) !important',
            filter: 'contrast(5) brightness(2) !important',
          },
          '&.force-dark-text': {
            color: '#000000 !important',
            fontWeight: 'bold !important',
            opacity: '1 !important',
            textShadow: '2px 2px 4px rgba(255,255,255,1) !important',
            filter: 'contrast(5) brightness(2) !important',
          },
        },
      },
    },
  },
})

// Define the item type for DnD
const ItemTypes = {
  CARD: 'card',
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
              bgcolor: '#333',
              color: 'white',
              '&:hover': {
                bgcolor: '#555',
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

// Card Details Component
const CardDetailsPopup = ({ open, card, onClose, onAssignToBin }) => {
  if (!card) return null

  // Function to get description based on card text
  const getCardDescription = (cardText) => {
    switch (cardText) {
      case 'Sterilization Protocol':
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
              {card.text === 'Sterilization Protocol' ? (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    Sterilization
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '2px 2px 2px rgba(0,0,0,0.3)',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    Protocol
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
              sx={{ mb: 2, fontWeight: 'bold' }}
            >
              {card.text}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getCardDescription(card.text)}
            </Typography>
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
              bgcolor: '#333',
              color: 'white',
              '&:hover': {
                bgcolor: '#555',
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
            onClick={() => onAssignToBin(card.id)}
            sx={{
              bgcolor: '#333',
              color: 'white',
              '&:hover': {
                bgcolor: '#555',
              },
              py: 1.5,
              px: 3,
              borderRadius: '4px',
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
}) => {
  const [implementation, setImplementation] = useState('')

  const handleSubmit = () => {
    onSubmit(implementation)
    setImplementation('')
  }

  const handleSkip = () => {
    onSkip()
    setImplementation('')
  }

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
        How would you implement this approach for this concern?
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
          placeholder="Add your implementation details here..."
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
            bgcolor: '#333',
            color: 'white',
            '&:hover': {
              bgcolor: '#555',
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
            bgcolor: '#6838bd',
            color: 'white',
            '&:hover': {
              bgcolor: '#5e26bd',
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

// Draggable concern card component with improved text visibility
const ConcernCard = ({ id, text, onDrop, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, text },
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
            height: '80px', // Smaller card height
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

// Static card component with improved text visibility
const StaticCard = ({ text }) => {
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
    <Box sx={{ mb: 1 }}>
      {' '}
      {/* Reduced margin bottom to stack closer */}
      <Card
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          width: '150px',
          height: '80px', // Smaller card height
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
    </Box>
  )
}

// Drop target component
const DropTarget = ({ name, placedCards, onDrop }) => {
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
    drop: (item) => {
      onDrop(item.id, name)
      return { name }
    },
    // Allow dropping multiple cards in this target
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }))

  return (
    <Box
      ref={drop}
      sx={{
        width: '150px',
        minHeight: '170px', // Minimum height for bins
        // Removed maxHeight to allow expansion with more cards
        border: '2px dashed #ccc',
        borderRadius: '10px',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: placedCards.length === 0 ? 'center' : 'flex-start', // Center text if empty
        bgcolor: isOver && canDrop ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
      }}
    >
      {placedCards.map((card) => (
        <StaticCard key={card.id} text={card.text} />
      ))}
      {placedCards.length === 0 && (
        <Typography 
          variant="body2" 
          sx={{
            color: isDarkMode ? 'white' : 'black',
            fontWeight: 'bold',
            backgroundColor: isDarkMode ? '#333333' : 'transparent',
            padding: isDarkMode ? '8px 16px' : '0',
            borderRadius: isDarkMode ? '12px' : '0',
            border: isDarkMode ? '1px solid #666666' : 'none',
            textAlign: 'center'
          }}
        >
          Drag cards here
        </Typography>
      )}
    </Box>
  )
}

// Completion Message Component
const CompletionMessage = () => {
  const { useSearchParams } = require('next/navigation')
  const searchParams = useSearchParams()
  const [sessionID, setSessionID] = useState('')

  return (
    <Box
      sx={{
        width: '200px',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px dashed #fff',
        borderRadius: '10px',
        backgroundColor: '#ccc',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <Typography
        variant="h4"
        align="center"
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
        align="center"
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
  const [sessionID, setSessionID] = useState('')
  const { useSearchParams } = require('next/navigation')
  const searchParams = useSearchParams()
  const [showConfigPopup, setShowConfigPopup] = useState(true)
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

  // Get the sessionID from URL params
  React.useEffect(() => {
    const urlSessionID = searchParams.get('sessionID')
    if (urlSessionID) {
      setSessionID(urlSessionID)
      setShowConfigPopup(false)
    } else {
      setShowConfigPopup(true)
    }
  }, [searchParams])


  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionID) {
      setShowConfigPopup(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Initial state with all 6 cards and their locations
  const [cards, setCards] = useState([
    { id: 1, text: 'Sterilization Protocol', visible: true, placed: false },
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

  // useEffect(() => {
  //   // Need to dynamically import useSearchParams because it requires client-side rendering
  //   const getSessionFromURL = async () => {
  //     try {
  //       const { useSearchParams } = require('next/navigation');
  //       const searchParams = useSearchParams();
  //       const urlSessionID = searchParams.get('sessionID');

  //       if (urlSessionID) {
  //         setSessionID(urlSessionID);
  //         setShowConfigPopup(false);
  //       } else {
  //         setShowConfigPopup(true);
  //       }
  //     } catch (error) {
  //       console.error("Error getting search params:", error);
  //       // If there's an error, ensure the config popup shows
  //       setShowConfigPopup(true);
  //     }
  //   };

  //   getSessionFromURL();
  // }, []);

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
  const handleAssignToBin = (cardId) => {
    // Default to constrain bin
    let targetBin = 'constrain'

    // Close the details popup
    setCardDetailsOpen(false)

    // Initiate the drop process
    const droppedCard = cards.find((card) => card.id === cardId)
    if (droppedCard) {
      setCurrentCard(droppedCard)
      setCurrentBin(targetBin)
      setPopupOpen(true)
    }
  }

  // Handle dropping a card in a bin
  const handleDrop = (cardId, binName) => {
    // Allow multiple cards per bin (removed 2-card limit)

    // Find the card that was dropped
    const droppedCard = cards.find((card) => card.id === cardId)
    if (!droppedCard || droppedCard.placed) {
      return // Card not found or already placed
    }

    // Save current card and bin for the popup
    setCurrentCard(droppedCard)
    setCurrentBin(binName)

    // Open the implementation popup
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
  const handleSubmit = () => {
    // Generate a unique student ID for this submission
    const uniqueStudentId = generateUniqueStudentId()
    console.log('Generated unique student ID:', uniqueStudentId)
    
    // Implement your submission logic here
    console.log('Form submitted with placements:', placedCards)
    console.log('Implementations:', implementations)
    console.log('Unique Student ID:', uniqueStudentId)

    // Form submitted successfully - could add redirect or other logic here
  }

  // Cards to display in the concerns section
  const visibleCards = cards.filter((card) => card.visible && !card.placed)

  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        {/* Remove the Container and add full-width container with left-aligned header */}
        <Box sx={{ width: '100%', px: 2, pt: '80px' }}>
          <SessionConfigPopup
            open={showConfigPopup}
            onClose={handleConfigClose}
          />

          {/* Main content in centered container */}
          <Container maxWidth="md">
            {/* Concerns Section */}
            <Paper
              elevation={1}
              sx={{
                p: 4,
                bgcolor: 'secondary.main',
                borderRadius: '10px',
                mb: 4,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Concerns to be Addressed
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Click on a card to learn more about it, then drag each to the
                stack below that represents the approach you think would most
                suitably address the concern in question.
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
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  Constrain
                </div>
                <DropTarget
                  name="constrain"
                  placedCards={placedCards.constrain}
                  onDrop={handleDrop}
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
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  Distribute
                </div>
                <DropTarget
                  name="distribute"
                  placedCards={placedCards.distribute}
                  onDrop={handleDrop}
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
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  Test
                </div>
                <DropTarget
                  name="test"
                  placedCards={placedCards.test}
                  onDrop={handleDrop}
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
                disabled={!allCardsPlaced}
                sx={{
                  bgcolor: allCardsPlaced ? '#4CAF50' : '#999',
                  color: 'white',
                  '&:hover': {
                    bgcolor: allCardsPlaced ? '#3d8b40' : '#777',
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: '4px',
                }}
              >
                SUBMIT
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Implementation Popup */}
        <ImplementationPopup
          open={popupOpen}
          card={currentCard}
          binName={currentBin}
          onClose={() => setPopupOpen(false)}
          onSkip={handleImplementationSkip}
          onSubmit={handleImplementationSubmit}
        />

        {/* Card Details Popup */}
        <CardDetailsPopup
          open={cardDetailsOpen}
          card={selectedCard}
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
