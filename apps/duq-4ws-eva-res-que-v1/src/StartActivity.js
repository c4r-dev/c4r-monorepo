
import {Link} from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import backgroundImage from './assets/ground-1.svg';
import Raven1 from './assets/raven-1.svg';

 const StartActivity = (props) => {
    return(
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
       
        <Grid container spacing={0} sx={{marginLeft:"1px"}}>
           <Grid item xs={8} sx={{marginLeft:"1px"}}>
                <div className="text-left ml-5">
                   <h1>Identification of the parts in a research question</h1> <br></br>
                   <h2 className="-mt-10"> Decide Strategies for certain objects in your research process.</h2>
                </div>
                <img src={Raven1} alt="Background" className="absolute left-[-192px] top-[181px]" />
            </Grid>
        <Grid  sx={{backgroundImage:`url(${backgroundImage})`,
             alignItems: 'block-end',
        }} item xs={12} >
                <Link to="/IdentifyResearchQues">
                {/* <img src="./ground-1.svg"></img> */}
                <button className="mt-[170px] ml-[300px]" type="submit">
                     Start Activity
                </button>
                </Link>
            </Grid>
        </Grid>
        </Box>
    )
}

export default StartActivity;