import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

export default function Bot() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4, // Increased gap between boxes
        padding: 4,
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        height: '100vh',
      }}
    >
      {/* First Box: Scrollable */}
      <Paper
        sx={{
          width: '200px',
          height: '300px',
          overflowY: 'auto',
          padding: 2,
          backgroundColor: '#ffffff',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="body2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque euismod nisi id
          libero vestibulum, sit amet venenatis felis ultricies. Lorem ipsum dolor sit amet...
        </Typography>
      </Paper>

      {/* Right Side: Second and Third Box */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4, // Increased vertical gap between boxes on the right
        }}
      >
        {/* Second Box: Static Text */}
        <Paper
          sx={{
            width: '200px',
            height: '100px',
            padding: 2,
            backgroundColor: '#e3f2fd',
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">
            Static text goes here. Add any information you&apos;d like to show to the user.
          </Typography>
        </Paper>

        {/* Third Box: Multi-line Input and Submit */}
        <Paper
          sx={{
            width: '200px',
            height: '200px',
            padding: 2,
            backgroundColor: '#ffffff',
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter your text"
            multiline
            rows={4} // Number of rows for multi-line input
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" fullWidth size="small">
            Submit
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
