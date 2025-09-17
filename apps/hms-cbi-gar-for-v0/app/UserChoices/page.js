// 'use client';
// import React, { useState , Suspense, useEffect} from 'react';
// import { Box, Typography, Grid, FormControlLabel, Checkbox, Button, Radio, RadioGroup ,Grid2} from '@mui/material';
// import ScatterPlot from "../components/ScatterPlot";
// import { useRouter, useSearchParams } from 'next/navigation';
// import ResultStatus from '../components/ResultStatus';

// export default function UserChoices() {
//   const [selectedX, setSelectedX] = useState([]);
//   const [selectedY, setSelectedY] = useState([]); // Set selectedY as an array to handle multiple selections
//   const [selectedRadioButton,setSelectedRadioButton] = useState("yearly_average"); // Set selectedRadioButton as an array to handle multiple selections
//   // const searchParams = useSearchParams();
//   const [sessionID, setSessionID] = useState(null);
//   const [hypothesisNumber, setHypothesisNumber] = useState(null);
//   const router = useRouter();


//   // function UseValues() {
//   //   const searchParams = useSearchParams()
//   //   setHypothesisNumber(searchParams.get('hypothesisNumber'))
//   //   setSessionID(searchParams.get('sessionID'))
//   //   // setSelectedVariable(searchParams.get('selectedVariable'))
//   //   return
//   // }

//   function UseValues() {
//     const searchParams = useSearchParams();

//     // Use useEffect to update state once after the initial render
//     useEffect(() => {
//       setHypothesisNumber(searchParams.get('hypothesisNumber'));
//       setSessionID(searchParams.get('sessionID'));
//     }, [searchParams]); // Dependency array to re-run if searchParams changes

//     return null; // Return null since this component is only used for setting values
//   }

//   const handleXChange = (event) => {
//     setSelectedX((prev) =>
//       event.target.checked ? [...prev, event.target.value] : prev.filter((val) => val !== event.target.value)
//     );
//   };

//   const handleYChange = (event) => {

//     console.log("this is in handle y change");

//     const value = event.target.value;
//     console.log(value, "this is the value");
//     setSelectedY((prev) =>
//       event.target.checked ? [...prev, value] : prev.filter((val) => val !== value)
//     ); // Add or remove the variable from selectedY array
//   };

//   const handleRadioButtons = (event) => {
//     setSelectedRadioButton(event.target.value); // Set selected radio button directly

//   }

//   return (
//     <>
//     <Suspense>
//         <UseValues />
//       </Suspense>
//     <Box position="relative" minHeight="100vh" pb={10}>
//       <Grid container spacing={3} alignItems="flex-start">
//         <Grid item="true" xs={12} md={2}>
//           <Typography variant="h6">Define Choices by prathima</Typography>
//           <Box mt={2}>
//             <Typography variant="subtitle1"><b>Which prathima  subset of data do you want to include?</b></Typography>
//             <FormControlLabel
//               control={<Checkbox value="choice_1" onChange={handleXChange} />}
//               label="Choice 1gfc"
//             />
//             <FormControlLabel
//               control={<Checkbox value="choice_2" onChange={handleXChange} />}
//               label="Choice 2gfcu"
//             />
//             <FormControlLabel
//               control={<Checkbox value="choice_3" onChange={handleXChange} />}
//               label="Choice 3"
//             />
//             <FormControlLabel
//               control={<Checkbox value="choice_4" onChange={handleXChange} />}
//               label="Choice 4"
//             />
//             <Box mt={2}>
//               <Typography variant="subtitle1"><b>What variables do you want to include?</b></Typography>
//               <FormControlLabel
//                 control={<Checkbox value="magnitude" />}
//                 label="Magnitude Prathima ssssss r"
//               />
//               <FormControlLabel
//                 control={<Checkbox value="injuries" onChange={handleYChange} />}
//                 label="Injuries"
//               />
//               <FormControlLabel
//                 control={<Checkbox value="fatalities" onChange={handleYChange} />}
//                 label="Fatalities"
//               />
//               <FormControlLabel
//                 control={<Checkbox value="property_damage" onChange={handleYChange} />}
//                 label="Property Damage"
//               />
//                <FormControlLabel
//                 control={<Checkbox value="size" onChange={handleYChange} />}
//                 label="Size"
//               />
//             </Box>
//             <Box mt={2}>
//               <Typography variant="subtitle1"><b>What Outcome do you want to analyze?</b></Typography>
//               <RadioGroup value={selectedRadioButton} onChange={handleRadioButtons}> {/* Set value to selectedY */}
//                 <FormControlLabel
//                   control={<Radio />}
//                   value="yearly_average"
//                   label="Yearly Average"
//                 />
//                 <FormControlLabel
//                   control={<Radio />}
//                   value="yearly_total"
//                   label="Yearly Total"
//                 />
//               </RadioGroup>
//             </Box>
//           </Box>
//         </Grid>

//         <Grid item xs={12} md={8}>
//           <Typography variant="h6" gutterBottom>Is There a Relationship?</Typography>
//           <Typography variant="body2" color="textSecondary" mb={2}>
//             Given how you&apos;ve defined your terms, are the choices better, worse, or about the same? Each dot below represents one month of data.
//           </Typography>
//           <Box mt={2} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//             {selectedY.length > 0 ? (
//               <ScatterPlot selectedX={selectedX} selectedY={selectedY} />
//             ) : (
//               <Typography mt={4} variant="body1" fontWeight="bold" color="purple" textAlign="center">
//                 No variable is selected
//                 <br />
//                 Select an outcome variable to begin
//               </Typography>
//             )}
//           </Box>
//            {/* Result Status Section */}
       
//         </Grid>

//         <Grid item xs={12} md={2} alignItems={"flex-end"}>
//           <ResultStatus />
//         </Grid> 
//       </Grid>

//       {/* Centered Bottom Buttons */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         position="absolute"
//         bottom={100}
//         left={10}
//         right={-100}
//         p={25}
//       >
//         {/* <Button
//           variant="contained"
//           color="primary"
//           onClick={() => router.push('/')} // Replace with your navigation logic
//         >
//           Back
//         </Button> */}

//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => router.push('/UserComparison')} // Replace with your navigation logic
//         >
//           Next
//         </Button>
//       </Box>
//     </Box>
//     </>
//   );
// }
