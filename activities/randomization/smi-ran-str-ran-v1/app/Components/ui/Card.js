import React from 'react';
import { Card as MuiCard, CardContent as MuiCardContent } from '@mui/material';

export const Card = ({ children, ...props }) => (
    <MuiCard {...props} sx={{ borderRadius: '16px', boxShadow: 3 }}>
        {children}
    </MuiCard>
);

export const CardContent = ({ children, ...props }) => (
    <MuiCardContent {...props}>{children}</MuiCardContent>
);
