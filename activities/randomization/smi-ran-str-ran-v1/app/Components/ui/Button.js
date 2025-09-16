import React from 'react';
import { Button as MuiButton } from '@mui/material';

export const Button = ({ children, ...props }) => (
    <MuiButton variant="contained" {...props} sx={{ textTransform: 'none', borderRadius: '8px', fontFamily: 'var(--font-general-sans-semi-bold)' }}>
        {children}
    </MuiButton>
);
