import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    }
}));

const StatsWidget = ({ title, value, color }) => {
    return (
        <StyledPaper elevation={3} color={color}>
            <Typography variant="h4" component="div" fontWeight="bold">
                {value}
            </Typography>
            <Typography variant="subtitle1" component="div">
                {title}
            </Typography>
        </StyledPaper>
    );
};

export default StatsWidget;
