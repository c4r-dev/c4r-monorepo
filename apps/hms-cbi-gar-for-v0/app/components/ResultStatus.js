// import React from 'react'
// import { Box, Typography } from '@mui/material'

// export default function ResultStatus({ correlation }) {
//   return (
//     <Box>
//       <Typography variant="h5" color="primary">
//         Correlation Coefficient
//       </Typography>
//       <Box
//         component="span"
//         sx={{
//           display: 'inline-block',
//           padding: '4px 8px',
//           border: '1px solid black',
//           borderRadius: '8px',
//           backgroundColor: 'transparent', // Optional: Add background color if needed
//         }}
//       >
//         <Typography variant="body2" color="primary">
//           {correlation !== null ? (
//             <b>r = {correlation.toFixed(3)}</b>
//           ) : (
//             <b>Yet to be determined</b>
//           )}
//         </Typography>
//       </Box>
//     </Box>
//   )
// }


import React from 'react';
import { Box, Typography } from '@mui/material';

const ResultStatus = ({ correlation }) => {
  // Helper function to determine the result text
  const getResultText = (r) => {
    if (r < -0.4) return 'Strong Negative Relationship';
    if (r >= -0.4 && r < -0.2) return 'Moderate Negative Relationship';
    if (r >= -0.2 && r < -0.05) return 'Weak Negative Relationship';
    if (r >= -0.05 && r <= 0.05) return 'No Relationship';
    if (r > 0.05 && r <= 0.2) return 'Weak Positive Relationship';
    if (r > 0.2 && r <= 0.4) return 'Moderate Positive Relationship';
    if (r > 0.4) return 'Strong Positive Relationship';
    return 'Invalid Correlation';
  };

  // Position the marker dynamically along the line based on correlation value
  const markerPosition = ((correlation + 1) / 2) * 100; // Scale -1 to 1 to 0% to 100%

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 2,
        padding: 2,
        // border: '1px solid #d3d3d3',
        // borderRadius: '8px',
        // backgroundColor: '#f9f9f9',
        width: '100%',
      }}
    >
      {/* Result Text */}
      <Typography variant="h5" color="primary">
        Result: {getResultText(correlation)}
      </Typography>
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
         marginTop: 2,
        padding: 2,
        border: '1px solid #d3d3d3',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '200%',
      }}
    >

      {/* Correlation Line */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '10px',
          marginTop: 2,
        //   border: '1px solid #d3d3d3',
        // borderRadius: '8px',
        // backgroundColor: '#f9f9f9',
        }}
      >
        {/* Line */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: '#d3d3d3',
            transform: 'translateY(-50%)',
          }}
        />

        {/* Marker */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: `${markerPosition}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#000', // Marker color
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Label */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              color: '#000', // Label color
            }}
          >
            {correlation?.toFixed(2)}
          </Typography>
        </Box>

        {/* Labels for -1, 0, and 1 */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
          }}
        >
          -1.0
        </Typography>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
          }}
        >
          0.0
        </Typography>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            transform: 'translateX(50%)',
            fontWeight: 'bold',
          }}
        >
          1.0
        </Typography>
      </Box>
      </Box>
    </Box>
  );
};

export default ResultStatus;
