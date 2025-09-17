'use client';
import React, { useState } from 'react';
import { Box, Button, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';
import ScatterPlot from './components/ScatterPlot';
import Histogram from "./components/Histogram";
import ResultStatus from './components/ResultStatus';
import olympians from '../app/components/data.json'; // Import your dataset

export default function HomePage() {
  const [selectedParty, setSelectedParty] = useState('Choices');
  const [selectedX, setSelectedX] = useState([]);
  const [selectedY, setSelectedY] = useState([]);
  const [showMale, setShowMale] = useState(true);
  const [showFemale, setShowFemale] = useState(true);
  const histogramData = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));

  
  const handlePartyChange = (party) => setSelectedParty(party);
  const handleHypothesisMale = (event) => {
    setShowMale(!showMale)
  }
  const handleHypothesisFemale = (event) => {
    setShowFemale(!showFemale)
  }
  const handleXChange = (event) => {
    setSelectedX((prev) =>
      event.target.checked ? [...prev, event.target.value] : prev.filter((val) => val !== event.target.value)
    );
  };
  const handleYChange = (event) => {
    setSelectedY((prev) =>
      event.target.checked ? [...prev, event.target.value] : prev.filter((val) => val !== event.target.value)
    );
  };

  return (
    <Box>
      {/* Party Selection */}
      <Box my={1} textAlign="center">
        <Button
          variant={selectedParty === 'Choices' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => handlePartyChange('Choices')}
          sx={{ marginRight: 2 }}
        >
          Choices
        </Button>
        <Button
          variant={selectedParty === 'Comparisions' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => handlePartyChange('Comparisions')}
        >
          Comparisions
        </Button>
      </Box>

      {/* Main content section */}
      <Grid container spacing={10} alignItems="flex-start">
        
        {/* Define Choices Section */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6">{selectedParty === "Choices" ? "Define Choices" : "Compare Hypothesis"}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle1"><b> {selectedParty === "Choices" ? "Which subset of data do you want to include?" : " Which hypothesis you want to include?"}</b></Typography>
            <FormControlLabel
              control={<Checkbox value="presidents" onChange={selectedParty === "Choices" ? handleXChange : handleHypothesisMale} />}
              label={selectedParty === "Choices" ? "Choice 1" : "Hypothesis 1"}
             checked={showMale}
              // onChange={() => setShowMale(!showMale)}
            />
            <FormControlLabel
              control={<Checkbox value="governors" onChange={selectedParty === "Choices" ? handleXChange : handleHypothesisFemale} />}
              label={selectedParty === "Choices" ? "Choice 2" : "Hypothesis 2"}  
               checked={showFemale}
              // onChange={() => setShowFemale(!showFemale)}         
               />
            <FormControlLabel
              control={<Checkbox value="senators" onChange={handleXChange} />}
              label={selectedParty === "Choices" ? "Choice 3" : "Hypothesis 3"}            />
          
            <FormControlLabel
              control={<Checkbox value="representatives" onChange={handleXChange} />}
              label={selectedParty === "Choices" ? "Choice 4" : "Hypothesis 4"}            />
          

          {selectedParty === "Choices" ? (
            <Box mt={2}>
              <Typography variant="subtitle1"><b>What variables do you want to include?</b></Typography>
              <FormControlLabel
                control={<Checkbox value="employment" onChange={handleYChange} />}
                label="Variable 1"
              />
              <FormControlLabel
                control={<Checkbox value="inflation" onChange={handleYChange} />}
                label="Variable 2"
              />
              <FormControlLabel
                control={<Checkbox value="gdp" onChange={handleYChange} />}
                label="Variable 3"
              />
              <FormControlLabel
                control={<Checkbox value="stock_prices" onChange={handleYChange} />}
                label="Variable 4"
              />
            </Box> )  : null}

            {selectedParty === "Choices" ? (
            <Box mt={2}>
              <Typography variant="subtitle1"><b>What outcomes do you want to include?</b></Typography>
              <FormControlLabel
                control={<Checkbox value="employment" onChange={handleYChange} />}
                label="Outcome 1"
              />
              <FormControlLabel
                control={<Checkbox value="inflation" onChange={handleYChange} />}
                label="Outcome 2"
              />
              <FormControlLabel
                control={<Checkbox value="gdp" onChange={handleYChange} />}
                label="Outcome 3"
              />
              <FormControlLabel
                control={<Checkbox value="stock_prices" onChange={handleYChange} />}
                label="Outcome 4"
              />
            </Box>) : null }
          </Box>
        </Grid>

        {/* Scatter Plot Section */}
       { /* <Grid item xs={12} md={6} style={{marginRight:"8%"}}>
          <Typography variant="h6">Is There a Relationship?</Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Given how you've defined your terms, does the economy do better, worse, or about the same
            when more {selectedParty} are in office? Each dot below represents one month of data.
          </Typography>
          <Box mt={2}>
            <ScatterPlot selectedX={selectedX} selectedY={selectedY} />
          </Box>
        </Grid> */}


         {/* Conditional Plot Section */}
         <Grid item xs={12} md={8} style={{marginRight:"8%"}}>
          <Typography variant="h6" gutterBottom>Is There a Relationship?</Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Given how you&apos;ve defined your terms, are the choices better, worse, or about the same
            when the tab {selectedParty} is selected? Each dot below represents one month of data.
          </Typography>
          <Box mt={2}>
            {selectedParty === 'Choices' ? (
              <ScatterPlot selectedX={selectedX} selectedY={selectedY} />
            ) : (
              <Histogram data={olympians} showFemale={showFemale} showMale={showMale} setShowFemale={setShowFemale} setShowMale={setShowMale}/>
            )}
          </Box>
          {/* <Box mt={2}>
            <ScatterPlot selectedX={selectedX} selectedY={selectedY} />
          </Box> */}
          </Grid>

        {/* Result Status Section */}
        {/* <Grid item xs={12} md={3}>
          <ResultStatus />
        </Grid> */}

      </Grid>
    </Box>
  );
}
