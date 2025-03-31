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
import { createUser } from '../../../../redux/userSlice';

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
    const [newClientData, setNewClientData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        notes: ''
    });

    // Formatear nombre completo para el Autocomplete
    const getFullName = (client) => {
        return `${client.firstName} ${client.lastName} (${client.email})`;
    };

    // Manejar cambios en el nuevo cliente
    const handleNewClientChange = (event) => {
        const { name, value } = event.target;
        setNewClientData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Abrir diálogo para nuevo cliente
    const handleOpenNewClientDialog = () => {
        setOpenNewClientDialog(true);
    };

    // Cerrar diálogo de nuevo cliente
    const handleCloseNewClientDialog = () => {
        setOpenNewClientDialog(false);
    };

    // Guardar nuevo cliente
    const handleSaveNewClient = () => {
        // Validar campos obligatorios
        if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
            alert('Por favor complete los campos obligatorios: Nombre, Apellido y Email');
            return;
        }
        
        // Crear el objeto de datos del usuario para enviar al servidor
        const userData = {
            name: newClientData.firstName,
            lastname: newClientData.lastName,
            email: newClientData.email,
            // Campos opcionales
            phone: newClientData.phone || null,
            address: newClientData.address || null,
            city: newClientData.city || null,
            country: newClientData.country || null,
            notes: newClientData.notes || null
        };

        // Dispatch para crear el nuevo usuario/cliente
        dispatch(createUser(userData))
            .unwrap()
            .then(newUser => {
                // Actualizar en el componente padre
                onNewClientCreated(newUser);
                
                setOpenNewClientDialog(false);
                // Limpiar formulario
                setNewClientData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    country: '',
                    notes: ''
                });
            })
            .catch(error => {
                console.error('Error al crear cliente:', error);
                alert(`Error al crear cliente: ${error.message || 'Error desconocido'}`);
            });
    };

    // Manejar selección en Autocomplete
    const handleClientSelectChange = (event, client) => {
        onClientSelect(client);
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
                            label="Seleccionar Cliente Existente"
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
                    Nuevo Cliente
                </Button>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Nombre del Cliente"
                    name="clientName"
                    value={formData.clientName}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Email del Cliente"
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
                    label="Teléfono del Cliente"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Dirección"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                />
            </Grid>

            {/* Diálogo para agregar nuevo cliente */}
            <Dialog open={openNewClientDialog} onClose={handleCloseNewClientDialog} maxWidth="md" fullWidth>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nombre *"
                                name="firstName"
                                value={newClientData.firstName}
                                onChange={handleNewClientChange}
                                required
                                error={!newClientData.firstName}
                                helperText={!newClientData.firstName ? "El nombre es obligatorio" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Apellido *"
                                name="lastName"
                                value={newClientData.lastName}
                                onChange={handleNewClientChange}
                                required
                                error={!newClientData.lastName}
                                helperText={!newClientData.lastName ? "El apellido es obligatorio" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email *"
                                name="email"
                                type="email"
                                value={newClientData.email}
                                onChange={handleNewClientChange}
                                required
                                error={!newClientData.email}
                                helperText={!newClientData.email ? "El email es obligatorio" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                name="phone"
                                value={newClientData.phone}
                                onChange={handleNewClientChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Dirección"
                                name="address"
                                value={newClientData.address}
                                onChange={handleNewClientChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Ciudad"
                                name="city"
                                value={newClientData.city}
                                onChange={handleNewClientChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="País"
                                name="country"
                                value={newClientData.country}
                                onChange={handleNewClientChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notas"
                                name="notes"
                                value={newClientData.notes}
                                onChange={handleNewClientChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                        * Campos obligatorios
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewClientDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSaveNewClient} 
                        color="primary" 
                        variant="contained"
                        disabled={!newClientData.firstName || !newClientData.lastName || !newClientData.email}
                    >
                        Guardar Cliente
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ClientSection; 