import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button,
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
    Skeleton,
    Card,
    CardContent,
    CardActions,
    Grid,
    Divider,
    Chip,
    useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import { 
    fetchUsers,
    deleteUser,
    selectAllUsers,
    selectUserStatus,
    selectUserError
} from '../../../redux/userSlice';
import DeleteDialog from '../dialogs/DeleteDialog';

const UserList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceDetection();
    const users = useSelector(selectAllUsers);
    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    const handleEdit = (userId) => {
        navigate(`/admin/users/edit/${userId}`);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (userToDelete) {
            try {
                await dispatch(deleteUser(userToDelete.id)).unwrap();
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleCreate = () => {
        navigate('/admin/users/create');
    };

    // Función para renderizar las tarjetas en vista móvil
    const renderMobileCards = () => {
        if (users.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">No users available</Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {users.map((user) => (
                    <Grid item xs={12} key={user.id}>
                        <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon sx={{ mr: 1 }} />
                                        {user.firstName} {user.lastName}
                                    </Typography>
                                    {user.country && (
                                        <Chip
                                            label={user.country}
                                            size="small"
                                            color="primary"
                                        />
                                    )}
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {user.phone && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {user.phone}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}

                                    {(user.city || user.country) && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {[user.city, user.country].filter(Boolean).join(', ')}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEdit(user.id)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(user)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    if (status === 'loading') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={160} height={40} />
                    <Skeleton variant="rectangular" width={140} height={36} />
                </Box>
                {isMobile || isTablet ? (
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, idx) => (
                            <Grid item xs={12} key={idx}>
                                <Card elevation={2} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Skeleton variant="text" width={180} height={28} />
                                            <Skeleton variant="rounded" width={80} height={24} />
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="text" width="40%" />
                                        <Skeleton variant="text" width="30%" />
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Name','Last Name','Email','Phone','City','Country','Actions'].map((h) => (
                                        <TableCell key={h}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(5)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell><Skeleton variant="text" width={140} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={140} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={220} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell>
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box sx={{ p: 3, color: 'error.main' }}>
                Error: {error}
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Users
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    New User
                </Button>
            </Box>

            {isMobile || isTablet ? (
                renderMobileCards()
            ) : (
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Country</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.firstName}</TableCell>
                                    <TableCell>{user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{user.city}</TableCell>
                                    <TableCell>{user.country}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => handleEdit(user.id)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteClick(user)} size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
            />
        </Box>
    );
};

export default UserList;
