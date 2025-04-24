import React from 'react';
import {
    Grid,
    TextField,
    Button,
    Autocomplete,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const ClientSection = ({ 
    formData, 
    clients, 
    selectedClient, 
    onClientSelect,
    onChange,
    onOpenNewClient,
    onOpenEditClient
}) => {
    // Formatear nombre completo para el Autocomplete
    const getFullName = (client) => {
        return `${client.firstName} ${client.lastName} (${client.email})`;
    };

    // Manejar selección en Autocomplete
    const handleClientSelectChange = (event, client) => {
        onClientSelect(client);
    };

    return (
        <>
            {/* Selector de cliente existente y botón de nuevo cliente */}
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
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: selectedClient && (
                                    <IconButton
                                        onClick={onOpenEditClient}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={onOpenNewClient}
                    startIcon={<AddIcon />}
                    sx={{ height: '56px' }}
                >
                    New Client
                </Button>
            </Grid>

            {/* Campos de información del cliente */}
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
        </>
    );
};

export default ClientSection; 