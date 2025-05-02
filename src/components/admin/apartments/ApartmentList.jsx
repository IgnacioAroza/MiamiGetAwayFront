import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    fetchAdminApartments,
    deleteAdminApartment,
    setSelectedApartment,
    selectAllApartments,
    selectApartmentStatus,
    selectApartmentError
} from '../../../redux/adminApartmentSlice';
import ApartmentForm from './ApartmentForm';
import DeleteConfirmDialog from '../../common/DeleteConfirmDialog';

const ApartmentList = () => {
    const dispatch = useDispatch();
    const apartments = useSelector(selectAllApartments);
    const status = useSelector(selectApartmentStatus);
    const error = useSelector(selectApartmentError);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [apartmentToDelete, setApartmentToDelete] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAdminApartments());
        }
    }, [status, dispatch]);

    const handleEdit = (item) => {
        dispatch(setSelectedApartment(item));
        setDialogOpen(true);
    };

    const handleDelete = async (item) => {
        setApartmentToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteAdminApartment(apartmentToDelete.id)).unwrap();
            setDeleteDialogOpen(false);
            setApartmentToDelete(null);
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    };

    const handleCreate = () => {
        dispatch(setSelectedApartment(null));
        setDialogOpen(true);
    };

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Apartments
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    New Apartment
                </Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Unit Number</TableCell>
                            <TableCell>Distribution</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Price per night</TableCell>
                            <TableCell>Images</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {apartments.map((apartment) => (
                            <TableRow key={apartment.id}>
                                <TableCell>{apartment.name}</TableCell>
                                <TableCell>{apartment.unitNumber}</TableCell>
                                <TableCell>
                                    {apartment.bathrooms} baths, {apartment.rooms} rooms
                                </TableCell>
                                <TableCell>{apartment.description}</TableCell>
                                <TableCell>{apartment.address}</TableCell>
                                <TableCell>{apartment.capacity}</TableCell>
                                <TableCell>{apartment.price}</TableCell>
                                <TableCell>{apartment.images?.length || 0} images</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEdit(apartment)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(apartment)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {apartments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No apartments available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ApartmentForm
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setApartmentToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Apartment"
                content="Are you sure you want to delete this apartment? This action cannot be undone."
            />
        </Box>
    );
};

export default ApartmentList;