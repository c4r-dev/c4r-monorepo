import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {Link} from 'react-router-dom';
import backgroundImage from './assets/ground-1.svg';

export default function IdentifyResearchQues() {
  return (
    <Box  sx={{
        width: 1200,
        height: 500,
        backgroundColor: 'white',
        boxShadow: 3, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'block-start',
        borderRadius: 2,
        textAlign: 'center',
        padding: 3,
        margin:"30px"
      }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
        <div style={{ textAlign: 'left', margin: "10px" }}><b>IDENTIFICATION OF PARTS IN THE RESEARCH QUESTION</b></div>
        </Grid>
        <Grid item xs={6}>
        <div style={{ textAlign: 'right', margin: "10px" }}> EXIT ACTIVITY X </div>
        </Grid>
        <Grid xs={4} sx={{textAlign:'start'}}>
        <div style={{
    display: "flex", 
    gap: "10px",
    alignItems: "center" 
  }}>
    <Link to="/bsQues" style={{ textDecoration: 'none' }}>
    <div style={{
      width: "200px", 
      height: "100px",
      backgroundColor: "#F031DD", 
      display: "flex", 
      alignItems: "left",
    }}>
      <p style={{color:"white", marginLeft:"30px"}}>Basic Science</p>
    </div>
    </Link>
    <Link to="/csQues" style={{ textDecoration: 'none' }}>
    <div style={{
      width: "200px", 
      height: "100px",
      backgroundColor: "#3172F0", 
      display: "flex", 
      alignItems: "block-start",
    }}>
      <p style={{color:"white"}}>Clinical Science</p>
    </div>
    </Link>
    <Link to="/phQues" style={{ textDecoration: 'none' }}>
    <div style={{
      width: "200px", 
      height: "100px",
      backgroundColor: "#FF7A00", 
      display: "flex", 
      alignItems: "block-start",
    }}>
      <p style={{color:"white"}}>Public Health</p>
    </div>
    </Link>
    </div>
    </Grid>
    <Grid  sx={{backgroundImage:`url(${backgroundImage})`,padding:'120px',
        }} item xs={12}>
    </Grid>
      </Grid>
      </Box>
  );
}