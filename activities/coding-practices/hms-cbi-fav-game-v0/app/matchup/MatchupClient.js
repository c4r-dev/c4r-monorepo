'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';

// Helper function to extract the last alphabetical character from a string.
function extractLastAlphabet(str) {
  const match = str.match(/[A-Za-z](?!.*[A-Za-z])/);
  return match ? match[0] : "";
}

export default function MatchupClient() {
  // Extract query parameters from the URL.
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get('sessionId'); // Extract sessionId from URL
  const subsessionIdFromParam = searchParams.get('subsessionId'); // Extract subsessionId from URL

  // Compute a fallback subsessionId if none exists in URL
  const computedSubsessionId = sessionId ? extractLastAlphabet(sessionId) : null;
  
  // Use the subsessionId from URL if available, otherwise use computed one
  const subsessionId = subsessionIdFromParam || computedSubsessionId;

  // State for rounds data, selected row, and the bias text.
  const [roundsData, setRoundsData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [biasText, setBiasText] = useState('');

  // Fetch the selections data based on sessionId and subsessionId
  useEffect(() => {
    async function fetchSelections() {
      try {
        if (sessionId && subsessionId) {
          // Fetch the document for the given sessionId
          const res = await fetch(`/api/selection?sessionId=${sessionId}`);
          if (!res.ok) {
            throw new Error('Error fetching selections');
          }
          const data = await res.json();

          // Find the subsession whose subsessionId matches
          const matchingSubsession = data.subsessions.find(
            (ss) => ss.subsessionId === subsessionId
          );

          if (matchingSubsession && Array.isArray(matchingSubsession.rounds)) {
            setRoundsData(matchingSubsession.rounds);
          } else {
            console.error('Subsession not found or invalid rounds array');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchSelections();
  }, [sessionId, subsessionId]);

  // Handle row (round) selection for UI highlighting.
  const handleRowSelection = (rowIndex) => {
    setSelectedRow(rowIndex);
  };

  // Handle the Results button click.
  const handleResultsClick = async () => {
    if (!sessionId || !subsessionId) {
      console.error('No sessionId or subsessionId available.');
      return;
    }

    // Determine the selected matchup from roundsData if a row is selected.
    const selectedMatchup = selectedRow !== null ? roundsData[selectedRow] : undefined;

    // Build the payload including the new selectedMatchup field.
    const payload = {
      sessionId,
      subsessionId, // Now correctly extracting from the URL
      biasText, // Text input from the user
      selectedMatchup, // The round object from roundsData
    };

    console.log('Payload:', payload);

    try {
      const res = await fetch(`/api/selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Error updating results:', res.statusText);
      } else {
        const data = await res.json();
        console.log('Results updated successfully:', data);
        
        // Navigate to the analyze page with sessionId and subsessionId in URL
        router.push(`/analyze?sessionId=${sessionId}&subsessionId=${subsessionId}`);
      }
    } catch (error) {
      console.error('Error in handleResultsClick:', error);
    }
  };

  const choices = [
    {
      title:"Analysis parameter: smoothing",
      choice:
        'Reduce noise by replacing each three-dimensional pixel (voxel) \u0027 s value with a weighted average of its neighbors within a radius of x pixels. Choose x so that the data most clearly shows a peak. ',
    },
    {
      title:"Analyzing the most correlated voxel",
      choice:
        'To quantify effect size: define a region of interest based on the three-dimensional pixels (voxels) that show strongest activation. Then, calculate correlation of this region with the stimulus type.',
    },
    {
      title:"Personality screen",
      choice:
        'Emotional people may have greater peaks in activity in response to emotional images. Have potential participants complete a personality inventory and recruit the more emotional ones.',
    },
    {
      title:"Simulate subjects",
      choice:
        'Improve efficiency by recruiting only 12 subjects and simulating an additional 12 subjects after data has been collected.',
    },
    {
      title:"A simple control",
      choice:
        'Compare responses to emotional pictures of humans and animals to a baseline of neutral landscapes.',
    },
    {
      title:"Multiple comparison correction",
      choice:
        "Divide the threshold for statistical significance for the experiment by the number of tests, i.e. the number of three-dimensional pixels (voxels) examined.",
    },
    {
      title:"Adjust region of interest",
      choice:
        'Define regions of interest in subject brain images based on known anatomical regions, then adjust the region of interest that gets analyzed for each participant to capture the peak of activation if it falls outside of, but near the anatomically defined region of interest.',
    },
    {
      title:"Statistical correction",
      choice:
        'Divide the threshold for statistical significance for the experiment by the number of tests, i.e. the number of three-dimensional pixels (voxels) examined.',
    },
  ]

  return (
    <div className="obstacle-container">
      {console.log(roundsData)}
      {/* Render one row per round */}
      {roundsData.map((round, rowIndex) => {
        // Determine which choice is selected and which is not.
        let selectedChoice, notSelectedChoice;
        if (round.isChoice1Selected) {
          selectedChoice = round.choice1;
          notSelectedChoice = round.choice2;
        } else if (round.isChoice2Selected) {
          selectedChoice = round.choice2;
          notSelectedChoice = round.choice1;
        } else {
          // Fallback: default to choice1 as selected.
          selectedChoice = round.choice1;
          notSelectedChoice = round.choice2;
        }

        return (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '70%',
              margin: '15px auto',
              padding: '10px',
              backgroundColor: selectedRow === rowIndex ? '#f4eafc' : 'transparent',
              border: selectedRow === rowIndex ? '5px solid #7d3c98' : '1px solid #ddd',
              borderRadius: '8px',
              transition: 'background-color 0.3s ease, border 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => handleRowSelection(rowIndex)}
          >
            <Button
              variant="contained"
              sx={{
                flex: 1,
                marginRight: 1,
                backgroundColor: '#7e57c2',
                color: '#fff',
              }}
            >
              {selectedChoice}
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 1,
                marginLeft: 1,
                backgroundColor: '#CBBCE7',
                color: '#fff',
              }}
            >
              {notSelectedChoice}
            </Button>
          </Box>
        );
      })}

      {/* TextField and Results Button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 3,
          width: '100%',
        }}
      >
        <TextField
          multiline
          rows={4}
          placeholder="How could bias arise from the choice you didn't pick?"
          variant="outlined"
          value={biasText}
          onChange={(e) => setBiasText(e.target.value)}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '70%',
            border: '1px solid black',
            marginBottom: 2,
          }}
        />
        <Button
          variant="contained"
          onClick={handleResultsClick}
          sx={{
            backgroundColor: '#7e57c2',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
        >
          Results
        </Button>
      </Box>
    </div>
  );
}

