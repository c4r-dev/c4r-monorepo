'use client';
import { Container, CssBaseline, Typography, Box } from '@mui/material';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <Container maxWidth="md">
          <Box my={4} textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom>
              P - Hacking
            </Typography>
            <Typography variant="body1">
              You are a user: The plot is affected by the user choices selected. 
              <br/>
              Hypothesis 1 - &quot;jhdcbkj kjdcnoiskn&quot;
              <br/>
              Hypothesis 2 - &quot;jhabxc sjhncikjsnc&quot;
              <br/>
              Hypothesis 3 - &quot;jhabxc sjhncikjsnc&quot;
              <br/>
              Hypothesis 4 - &quot;jhabxc sjhncikjsnc&quot;
              {/* Republicans or Democrats are in office. Try to show that a connection exists, using real data going back to 1948.
              For your results to be publishable in an academic journal, you will need to prove that they 
              are "statistically significant" by achieving a low enough p-value. */}
            </Typography>
          </Box>
          {children}
        </Container>
      </body>
    </html>
  );
}
