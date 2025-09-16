'use client';

import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Trophy, Clock, GripVertical } from 'lucide-react';

const discoveries = [
  {
    id: 1,
    event: "Galvani's frog leg experiments demonstrate 'animal electricity'",
    description: "Galvani systematically tested dissected frog legs by touching them with different metal combinations while hanging from iron hooks. When he used two different metals simultaneously, the legs contracted more vigorously than with single metals, suggesting the tissue itself generated electricity rather than just conducting it from external sources.",
    year: 1780
  },
  {
    id: 2,
    event: "Bernstein proposes membrane theory of nerve conduction",
    description: "Bernstein built his theory on Hermann's experiments showing that injured muscle tissue had different electrical potential than healthy tissue, and on new cell staining techniques revealing distinct cell boundaries. His key insight came from combining these electrical measurements with microscopic evidence that cells were surrounded by semi-permeable membranes.",
    year: 1871
  },
  {
    id: 3,
    event: "Adrian and Lucas establish the 'all-or-nothing' law",
    description: "Using string galvanometers sensitive enough to record from single nerve fibers, Adrian and Lucas systematically varied stimulus intensity while measuring nerve impulse amplitude. Their recordings showed that once threshold was reached, increasing stimulus strength only increased firing frequency, never impulse size.",
    year: 1912
  },
  {
    id: 4,
    event: "J.Z. Young discovers the giant squid axon",
    description: "Young was dissecting squid nervous systems when he noticed unusually thick nerve fibers running to the animal's jet propulsion muscles. Microscopic measurements revealed these axons were up to 1000 times wider than typical mammalian nerves, making them large enough to insert recording electrodes directly inside for the first time.",
    year: 1936
  },
  {
    id: 5,
    event: "Hodgkin-Huxley model published",
    description: "Using voltage clamp electrodes inserted into squid giant axons, Hodgkin and Huxley measured ionic currents while controlling membrane voltage. Their experiments with different ion concentrations and selective blockers revealed that sodium influx caused depolarization while potassium efflux caused repolarization, leading to their mathematical equations.",
    year: 1952
  },
  {
    id: 6,
    event: "Neher and Sakmann develop patch clamp technique",
    description: "Neher and Sakmann pressed glass micropipettes against cell membranes to isolate tiny patches containing just a few ion channels. Their ultra-sensitive amplifiers could detect picoampere currents from individual channels, revealing the discrete opening and closing events that Hodgkin and Huxley had predicted from their mathematical models.",
    year: 1976
  },
  {
    id: 7,
    event: "Numa's laboratory clones voltage-gated sodium channels",
    description: "Numa's team purified sodium channel proteins using the binding specificity of tetrodotoxin, then used protein sequencing to design DNA probes. Their cloning experiments in frog oocytes showed that the expressed channels reproduced the same voltage-dependent gating and tetrodotoxin sensitivity observed in patch clamp recordings.",
    year: 1984
  },
  {
    id: 8,
    event: "MacKinnon reveals atomic structure of ion channels",
    description: "MacKinnon crystallized potassium channels from bacteria and used X-ray diffraction to determine atomic positions within the protein. His structural data showed exactly how the channel's selectivity filter discriminates between potassium and sodium ions, explaining the selectivity mechanisms that Hille had characterized through electrophysiological experiments.",
    year: 1998
  }
];

export default function NeuroscienceTimelineGame() {
  const [gameState, setGameState] = useState('start'); // start, playing, finished
  const [timeline, setTimeline] = useState<typeof discoveries>([]);
  const [currentItem, setCurrentItem] = useState<typeof discoveries[0] | null>(null);
  const [remainingItems, setRemainingItems] = useState<typeof discoveries>([]);
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState<typeof discoveries[0] | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState<Array<{itemId: number, placedIndex: number, correctIndex: number, points: number, correct: boolean}>>([]);
  const [feedback, setFeedback] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<{item: typeof discoveries[0], index: number} | null>(null);

  const startGame = () => {
    const shuffled = [...discoveries].sort(() => Math.random() - 0.5);
    const startingItem = shuffled[0];
    const remaining = shuffled.slice(1);
    
    setTimeline([startingItem]);
    setCurrentItem(remaining[0]);
    setRemainingItems(remaining.slice(1));
    setScore(0);
    setPlacementFeedback([]);
    setFeedback('');
    setGameState('playing');
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const calculateScore = (placedIndex: number, correctIndex: number, timelineLength: number) => {
    const maxDistance = Math.max(correctIndex, timelineLength - correctIndex);
    const distance = Math.abs(placedIndex - correctIndex);
    const accuracy = Math.max(0, 1 - (distance / maxDistance));
    return Math.round(accuracy * 100);
  };

  const handleDragStart = (e: React.DragEvent, item: typeof discoveries[0]) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, insertIndex: number) => {
    e.preventDefault();
    if (!draggedItem || !currentItem || draggedItem.id !== currentItem.id) return;

    // Store the pending placement for confirmation
    setPendingPlacement({ item: draggedItem, index: insertIndex });
    setShowConfirmModal(true);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const confirmPlacement = () => {
    if (!pendingPlacement) return;

    const { item, index } = pendingPlacement;
    const newTimeline = [...timeline];
    newTimeline.splice(index, 0, item);
    
    // Find where it should actually go
    const sortedTimeline = [...newTimeline].sort((a, b) => a.year - b.year);
    const correctIndex = sortedTimeline.findIndex(timelineItem => timelineItem.id === item.id);
    
    const points = calculateScore(index, correctIndex, newTimeline.length);
    setScore(prev => prev + points);
    
    if (index === correctIndex) {
      setFeedback(`Perfect! +${points} points`);
    } else {
      setFeedback(`+${points} points. Correct position would be slot ${correctIndex + 1}`);
    }
    
    const feedbackItem = {
      itemId: item.id,
      placedIndex: index,
      correctIndex: correctIndex,
      points: points,
      correct: index === correctIndex
    };
    
    setPlacementFeedback(prev => [...prev, feedbackItem]);
    setTimeline(newTimeline);
    
    setTimeout(() => {
      if (remainingItems.length > 0) {
        setCurrentItem(remainingItems[0]);
        setRemainingItems(remainingItems.slice(1));
        setFeedback('');
        // Scroll to top for next discovery
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentItem(null);
        setGameState('finished');
        // Scroll to top for final results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 2000);
    
    setShowConfirmModal(false);
    setPendingPlacement(null);
  };

  const cancelPlacement = () => {
    setShowConfirmModal(false);
    setPendingPlacement(null);
  };

  const getFinalGrade = () => {
    const maxPossibleScore = discoveries.length * 100;
    const percentage = (score / maxPossibleScore) * 100;
    if (percentage >= 90) return { grade: 'A+', message: 'Neuroscience Historian!' };
    if (percentage >= 80) return { grade: 'A', message: 'Excellent Timeline Skills!' };
    if (percentage >= 70) return { grade: 'B+', message: 'Good Historical Knowledge!' };
    if (percentage >= 60) return { grade: 'B', message: 'Solid Understanding!' };
    if (percentage >= 50) return { grade: 'C+', message: 'Room for Improvement' };
    return { grade: 'C', message: 'Keep Learning!' };
  };

  const getItemFeedback = (itemId: number) => {
    return placementFeedback.find(f => f.itemId === itemId);
  };

  if (gameState === 'start') {
    return (
      <div 
        style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: '24px',
          minHeight: 'calc(100vh - 60px)',
          background: 'linear-gradient(to bottom right, rgb(219, 234, 254), rgb(224, 231, 255))'
        }}
      >
        <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
          <div style={{ marginBottom: '32px' }}>
            <Clock style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', color: '#4f46e5' }} />
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Test your knowledge of action potential research history</p>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
            padding: '32px', 
            marginBottom: '32px', 
            maxWidth: '672px', 
            margin: '0 auto 32px auto' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>How to Play</h2>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <p style={{ marginBottom: '12px' }}>You&apos;ll start with one random discovery already placed on the timeline</p>
              <p style={{ marginBottom: '12px' }}>Drag and drop the remaining discoveries into the correct chronological order</p>
              <p style={{ marginBottom: '12px' }}>Read the detailed descriptions carefully - they contain context clues about when discoveries occurred</p>
              <p style={{ marginBottom: '12px' }}>Look for references to earlier work, technological capabilities, and historical context</p>
              <p style={{ marginBottom: '12px' }}>Consider how each discovery builds upon previous knowledge and enables future breakthroughs</p>
              <p style={{ marginBottom: '12px' }}>Earn points based on how close you get to the correct position</p>
              <p style={{ marginBottom: '12px' }}>Perfect placement = 100 points, close guesses still earn partial credit</p>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              background: '#4f46e5',
              color: 'white',
              fontWeight: '600',
              padding: '12px 32px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'background-color 200ms'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#4338ca'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#4f46e5'}
          >
            <Shuffle style={{ width: '20px', height: '20px' }} />
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalGrade = getFinalGrade();
    const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);
    
    return (
      <div 
        style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: '24px',
          minHeight: 'calc(100vh - 60px)',
          background: 'linear-gradient(to bottom right, rgb(236, 253, 245), rgb(209, 250, 229))'
        }}
      >
        <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
          <Trophy style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', color: '#eab308' }} />
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Challenge Complete!</h1>
          
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '32px',
            marginBottom: '32px',
            maxWidth: '672px',
            margin: '0 auto 32px auto'
          }}>
            <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '8px' }}>{finalGrade.grade}</div>
            <div style={{ fontSize: '20px', color: '#374151', marginBottom: '16px' }}>{finalGrade.message}</div>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>
              Final Score: <span style={{ fontWeight: '600' }}>{score}</span> out of {discoveries.length * 100} points
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '24px',
            marginBottom: '32px',
            maxWidth: '768px',
            margin: '0 auto 32px auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>Correct Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedTimeline.map((item, index) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    background: '#4f46e5',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.event}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{item.description}</div>
                  </div>
                  <div style={{ color: '#4f46e5', fontWeight: '600' }}>{item.year}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setGameState('start')}
            style={{
              background: '#4f46e5',
              color: 'white',
              fontWeight: '600',
              padding: '12px 32px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'background-color 200ms'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#4338ca'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#4f46e5'}
          >
            <RotateCcw style={{ width: '20px', height: '20px' }} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px',
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(to bottom right, rgb(253, 244, 255), rgb(252, 231, 243))',
        overflow: 'visible'
      }}
    >
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Drag and drop the remaining discoveries into the correct chronological order</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Score: </span>
            <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{score}</span>
          </div>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Remaining: </span>
            <span style={{ fontWeight: 'bold', color: '#a855f7' }}>{remainingItems.length + 1}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid #4f46e5'
        }}>
          <p style={{ color: '#1f2937', fontWeight: '500' }}>{feedback}</p>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Current Item to Place */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <GripVertical style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            Discovery to Place
          </h2>
          {currentItem && (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, currentItem)}
              style={{
                padding: '16px',
                border: '2px dashed #d8b4fe',
                borderRadius: '8px',
                cursor: 'move',
                background: 'linear-gradient(to right, #f3e8ff, #fce7f3)',
                transition: 'all 200ms'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#818cf8';
                e.currentTarget.style.background = '#eef2ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#d8b4fe';
                e.currentTarget.style.background = 'linear-gradient(to right, #f3e8ff, #fce7f3)';
              }}
            >
              <div style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <GripVertical style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                {currentItem.event}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{currentItem.description}</div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>Current Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Drop zone at the beginning */}
            <div
              onDragOver={(e) => handleDragOver(e, 0)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 0)}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px dashed ${dragOverIndex === 0 ? '#4f46e5' : '#d1d5db'}`,
                borderRadius: '8px',
                transition: 'all 200ms',
                background: dragOverIndex === 0 ? '#e0e7ff' : 'transparent',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                if (dragOverIndex !== 0) {
                  e.currentTarget.style.borderColor = '#818cf8';
                  e.currentTarget.style.background = '#eef2ff';
                }
              }}
              onMouseOut={(e) => {
                if (dragOverIndex !== 0) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                {dragOverIndex === 0 ? 'Drop here (earliest)' : 'Drop here (earliest)'}
              </div>
            </div>
            
            {timeline.map((item, index) => {
              const feedback = getItemFeedback(item.id);
              return (
                <div key={`${item.id}-${index}`}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      feedback?.correct
                        ? '#22c55e'
                        : feedback
                        ? '#fb923c'
                        : '#e5e7eb'
                    }`,
                    background: feedback?.correct
                      ? '#dcfce7'
                      : feedback
                      ? '#fed7aa'
                      : '#f9fafb'
                  }}>
                    <div style={{
                      background: '#4f46e5',
                      color: 'white',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.event}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{item.description}</div>
                      {feedback && (
                        <div style={{
                          fontSize: '12px',
                          marginTop: '8px',
                          fontWeight: '500',
                          color: feedback.correct ? '#15803d' : '#ea580c'
                        }}>
                          {feedback.correct 
                            ? `Perfect! +${feedback.points} points` 
                            : `+${feedback.points} points (correct position: ${feedback.correctIndex + 1})`
                          }
                        </div>
                      )}
                    </div>
                    <div style={{ color: '#4f46e5', fontWeight: '600' }}>{item.year}</div>
                  </div>
                  
                  {/* Drop zone after each item */}
                  <div
                    onDragOver={(e) => handleDragOver(e, index + 1)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index + 1)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px dashed ${dragOverIndex === index + 1 ? '#4f46e5' : '#d1d5db'}`,
                      borderRadius: '8px',
                      transition: 'all 200ms',
                      marginTop: '8px',
                      background: dragOverIndex === index + 1 ? '#e0e7ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      if (dragOverIndex !== index + 1) {
                        e.currentTarget.style.borderColor = '#818cf8';
                        e.currentTarget.style.background = '#eef2ff';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (dragOverIndex !== index + 1) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      {dragOverIndex === index + 1 ? 'Drop here' : 'Drop here'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingPlacement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '24px',
            maxWidth: '448px',
            margin: '0 16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Confirm Placement</h3>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>
              You&apos;re about to place:
            </p>
            <div style={{
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                {pendingPlacement.item.event}
              </div>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              at position <span style={{ fontWeight: '600' }}>{pendingPlacement.index + 1}</span> in the timeline.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelPlacement}
                style={{
                  padding: '8px 16px',
                  color: '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 200ms'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.color = '#1f2937'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.color = '#6b7280'}
              >
                Cancel
              </button>
              <button
                onClick={confirmPlacement}
                style={{
                  padding: '8px 16px',
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 200ms'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#4338ca'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#4f46e5'}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}