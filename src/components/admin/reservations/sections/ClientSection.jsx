import React, { useState } from 'react';
import {
    Grid,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch } from 'react-redux';
import CreateUser from '../../users/CreateUser';

const ClientSection = ({ 
    formData, 
    clients, 
    selectedClient, 
    onClientSelect, 
    onNewClientCreated,
    onChange 
}) => {
    const dispatch = useDispatch();
    const [openNewClientDialog, setOpenNewClientDialog] = useState(false);

    // Formatear nombre completo para el Autocomplete
    const getFullName = (client) => {
        return `${client.firstName} ${client.lastName} (${client.email})`;
    };

    // Abrir diálogo para nuevo cliente
    const handleOpenNewClientDialog = () => {
        setOpenNewClientDialog(true);
    };

    // Cerrar diálogo de nuevo cliente
    const handleCloseNewClientDialog = () => {
        setOpenNewClientDialog(false);
    };

    // Manejar selección en Autocomplete
    const handleClientSelectChange = (event, client) => {
        onClientSelect(client);
    };

    // Manejar la creación exitosa de un nuevo cliente
    const handleClientCreated = (newUser) => {
        onNewClientCreated(newUser);
        setOpenNewClientDialog(false);
    };

    return (
        <>
            {/* Selector de cliente existente */}
            <Grid item xs={12} md={9}>
                <Autocomplete
                    id="client-select"
                    options={clients}
                    getOptionLabel={getFullName}
                    value={selectedClient}
                    onChange={handleClientSelectChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Existing Client"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </Grid>

            {/* Botón para agregar nuevo cliente */}
            <Grid item xs={12} md={3}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={handleOpenNewClientDialog}
                    startIcon={<AddIcon />}
                    sx={{ height: '56px' }}
                >
                    New Client
                </Button>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Client Name"
                    name="clientName"
                    value={formData.clientName}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Client Email"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Client Phone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="City"
                    name="clientCity"
                    value={formData.clientCity}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>

            {/* Diálogo para agregar nuevo cliente */}
            <Dialog 
                open={openNewClientDialog} 
                onClose={handleCloseNewClientDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        color: '#fff'
                    }
                }}
            >
                <DialogTitle>Add New Client</DialogTitle>
                <DialogContent>
                    <CreateUser 
                        isDialog={true}
                        onSuccess={handleClientCreated}
                        onCancel={handleCloseNewClientDialog}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClientSection; 