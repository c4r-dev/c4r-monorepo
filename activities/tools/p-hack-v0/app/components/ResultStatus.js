import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ResultStatus() {
  return (
    <Box>
      <Typography variant="h6">Is Your Result Significant?</Typography>
      <Typography variant="body2" color="textSecondary">
        If there were no connection between the economy and politics, what is the probability that you&apos;d get results at least as strong as yours?
      </Typography>
      <Typography variant="h5" color="primary">
        Result: Publishable
      </Typography>
      <Typography variant="body2">
        You achieved a p-value of less than 0.01 and showed that the selected party has a significant effect on the economy.
      </Typography>
    </Box>
  );
}
