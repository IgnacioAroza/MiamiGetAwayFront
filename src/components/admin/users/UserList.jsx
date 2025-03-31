import React, { useEffect, useState } from 'react';
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
    Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    fetchUsers,
    deleteUser,
    setSelectedUser,
    selectAllUsers,
    selectUserStatus,
    selectUserError
} from '../../../redux/userSlice';

const UserList = () => {
    const dispatch = useDispatch();
    const users = useSelector(selectAllUsers);
    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [status, dispatch]);

    const handleEdit = (user) => {
        dispatch(setSelectedUser(user));
        setDialogOpen(true);
    };

    const handleDelete = async (user) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await dispatch(deleteUser(user.id)).unwrap();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
            }
        }
    };

    const handleCreate = () => {
        dispatch(setSelectedUser(null));
        setDialogOpen(true);
    };

    if (status === 'loading') {
        return <Box sx={{ p: 3 }}>Cargando...</Box>;
    }

    if (status === 'failed') {
        return <Box sx={{ p: 3, color: 'error.main' }}>Error: {error}</Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Usuarios
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Usuario
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Apellido</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Ciudad</TableCell>
                            <TableCell>País</TableCell>
                            <TableCell>Acciones</TableCell>
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
                                    <Tooltip title="Editar">
                                        <IconButton onClick={() => handleEdit(user)} size="small">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton onClick={() => handleDelete(user)} size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Aquí irá el diálogo de edición/creación */}
        </Box>
    );
};

export default UserList; 