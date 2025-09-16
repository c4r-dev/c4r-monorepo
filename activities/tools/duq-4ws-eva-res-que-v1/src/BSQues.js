import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import twigs from "./assets/twigs.svg";
import feathers from "./assets/feathers.svg";
import moss from "./assets/moss.svg";
import eggs from "./assets/eggs.svg";
import Raven1 from './assets/raven-1.svg';
import questions from './questions/questions.json';

export default function BSQues() {
  const [isUserReady, setIsUserReady] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isCorrectAnswer, setCorrectAnswer] = useState(false);

  const handleReady = () => {
    console.log(isUserReady + "isUserReady","hi");
    setIsUserReady(true)
  }

  const handleNextQuestion = () => {
    console.log(questionNumber + "questionNumber");
    setQuestionNumber(prevQuestionNumber => (questionNumber + 1) % 4 );
  }

  const handlePrevQuestion = () => {
    console.log(questionNumber + "questionNumber");
    setQuestionNumber(prevQuestionNumber => (questionNumber-1) % 4 );
  }

  const handleWhyAnswer = () => {
    console.log();
    setCorrectAnswer(true);
  }

  return (
    <Box  sx={{
      width: 1200,
      height: 500,
      backgroundColor: 'white',
      boxShadow: 3, 
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'block-start',
      borderRadius: 2,
      // textAlign: 'center',
      // padding: 3,
      margin:"30px"
    }}>
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={6}>
      <div style={{ textAlign: 'left', margin: "10px" }}><b>IDENTIFICATION OF PARTS IN THE RESEARCH QUESTION</b></div>
      </Grid>
      <Grid item xs={6}>
      <div style={{ textAlign: 'right', margin: "10px" }}> EXIT ACTIVITY X </div>
      </Grid>
      </Grid>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={4}>
          <h3 style={{ textAlign: 'left', marginLeft: "100px" }}>THE RESEARCH QUESTION</h3>
        </Grid>
        </Grid>
     <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={8} style={{marginTop:"-40px"}}>
          <h2 style={{ textAlign: 'left', marginLeft: "100px" }}>Determine whether disparities in the recipt of</h2>
        </Grid>
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={8} style={{marginTop:"-40px"}}>
          <h2 style={{ textAlign: 'left', marginLeft: "100px" }}>appropriate analgesia exist aming</h2>
        </Grid>
    </Grid>
    <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={8} style={{marginTop:"-40px"}}>
          <h2 style={{ textAlign: 'left', marginLeft: "100px" }}>people with Parkinson's disease(PD) with pain </h2>
        </Grid>
    </Grid>
    {isUserReady ? null : <button onClick={handleReady}>I'm ready</button>}
    {
      isUserReady ?  <>
    <Grid container columnSpacing={{ xs: 0, sm: 0, md: 0 }}>
      <Grid xs={3} >
          <button style={{ border: questionNumber === 0 ? null : 'none', color:questionNumber === 0 ?'black':'grey', fontWeight:questionNumber === 0 ?'bold':'none' }}>1.WHY?</button>
        </Grid>
        <Grid  xs={3} >
        <button style={{ border: questionNumber === 1 ? null : 'none', color:questionNumber === 1 ?'black':'grey', fontWeight:questionNumber === 1 ?'bold':'none' }}>2.WHO?</button>

        </Grid>
        <Grid  xs={3} >
        <button style={{ border: questionNumber === 2 ? null : 'none', color:questionNumber === 2 ?'black':'grey', fontWeight:questionNumber === 2 ?'bold':'none' }}>3.HOW?</button>

        </Grid>
        <Grid  xs={3} >
        <button style={{ border: questionNumber === 3 ? null : 'none', color:questionNumber === 3 ?'black':'grey', fontWeight:questionNumber === 3 ?'bold':'none' }}>4.WHAT?</button>

        </Grid>
       
    </Grid> 

     <Grid container columnSpacing={{ xs: 0, sm: 0, md: 0 }}>
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
    <div style={{color:'red'}}><b>X</b> Try Again </div>
        </Grid>
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
          <div><b>Determine</b></div>
        </Grid>
    </Grid> 

    <Grid container columnSpacing={{ xs: 0, sm: 0, md: 0 }}>
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
    {
          isCorrectAnswer ? <div style={{color:'green'}}><b> v </b> Correct </div> : <div style={{color:'red'}}><b>X</b> Try Again </div>
         } 
        </Grid>
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
          <div onClick={handleWhyAnswer}><b>disparities in the receipt</b></div>
        </Grid>
    </Grid>
    <Grid container columnSpacing={{ xs: 0, sm: 0, md: 0 }}>
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
          <div style={{color:'red'}}><b>X</b> Try Again </div>
        </Grid>
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
          <div><b>appropriate analgesia</b></div>
        </Grid>
    </Grid>
    <Grid container columnSpacing={{ xs: 0, sm: 0, md: 0 }}>
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={2}>
          <div style={{color:'red'}}><b>X</b> Try Again </div>
        </Grid>
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} xs={6}>
          <div><b>people with Parkinson's disease(PD) with chronic pain</b></div>
        </Grid>
        <button onClick={handlePrevQuestion}>Prev</button>
        <button onClick={handleNextQuestion}>Next</button>

    </Grid>  
     </> :

<>
<Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={4} style={{marginLeft:'-100px'}}>
          {/* <button style={{backgroundColor:'black', color:'white'}} onClick={() => handleReady()}>I'm ready</button> */}
          {/* <button onClick={handleReady}>click me</button> */}
        </Grid>
    </Grid>

    <img src={Raven1} alt="Background" style={{ position: 'absolute', left: '-230px',top:'230px'}} />
    <Grid sx={{alignItems:'block-end', margin:'59px 10px 10px 10px'}} container spacing={2}>
        <Grid item xs={3}>
        <img src={twigs} alt="Background"  />
        <div >WHY?</div>
        </Grid>
        <Grid item xs={3}>
        <img src={feathers} alt="Background" />
        <div>WHO?</div>
     </Grid>
     <Grid item xs={3}>
     <img src={moss} alt="Background"  />
     <div>HOW?</div>
     </Grid>
     <Grid item xs={3}>
     <img src={eggs} alt="Background"  />
     <div>WHAT?</div>
     </Grid>
     </Grid>  
    </>
    }
    </Box>
  );
}