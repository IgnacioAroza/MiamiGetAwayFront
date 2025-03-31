import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export const ListItemLink = (props) => {
    const { to, primary, icon } = props;
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
        <ListItem 
            button 
            component={RouterLink} 
            to={to}
            sx={{
                borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                }
            }}
        >
            {icon && <ListItemIcon sx={{ color: isActive ? '#fff' : 'inherit' }}>{icon}</ListItemIcon>}
            <ListItemText primary={primary} sx={{ color: isActive ? '#fff' : 'inherit' }} />
        </ListItem>
    );
};

export default ListItemLink; 