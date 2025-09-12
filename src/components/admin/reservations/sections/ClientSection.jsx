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
        const name = `${client.firstName || client.name} ${client.lastName || client.lastname}`;
        return client.email ? `${name} (${client.email})` : name;
    };

    // Manejar selección en Autocomplete
    const handleClientSelectChange = (event, client) => {
        onClientSelect(client);
    };

    return (
        <Grid container spacing={2}>
            {/* Selector de cliente existente y botón de nuevo cliente */}
            <Grid item xs={12} md={8}>
                <Autocomplete
                    id="client-select"
                    options={clients}
                    getOptionLabel={getFullName}
                    value={selectedClient}
                    onChange={handleClientSelectChange}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {getFullName(option)}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Select Existing Client"
                            variant="outlined"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#4A4747',
                                    borderRadius: 1,
                                    '& fieldset': { borderColor: '#717171' },
                                    '&:hover fieldset': { borderColor: '#717171' },
                                    '&.Mui-focused fieldset': { borderColor: '#717171' },
                                },
                                '& .MuiInputLabel-root': { 
                                    color: '#888',
                                    '&.Mui-focused': { color: '#888' }
                                },
                                '& .MuiOutlinedInput-input': { 
                                    color: '#fff',
                                    padding: '12px 16px'
                                },
                                '& .MuiSvgIcon-root': { color: '#ccc' },
                                '& .MuiAutocomplete-input': {
                                    color: '#fff !important'
                                }
                            }}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: selectedClient && (
                                    <IconButton
                                        onClick={onOpenEditClient}
                                        size="small"
                                        sx={{ color: '#ccc' }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    )}
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: '#4A4747',
                            color: '#fff',
                        },
                        '& .MuiAutocomplete-option': {
                            color: '#fff',
                            '&:hover': { backgroundColor: '#555' },
                            '&.Mui-focused': { backgroundColor: '#555' }
                        }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onOpenNewClient}
                    startIcon={<AddIcon />}
                    sx={{ 
                        height: '56px',
                        backgroundColor: '#5a67d8',
                        color: '#fff',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: '#4c51bf'
                        }
                    }}
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
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#4A4747',
                            borderRadius: 1,
                            '& fieldset': { borderColor: '#717171' },
                            '&:hover fieldset': { borderColor: '#717171' },
                            '&.Mui-focused fieldset': { borderColor: '#717171' },
                            '&.Mui-disabled': {
                                backgroundColor: '#3a3a3a',
                                '& fieldset': { borderColor: '#555' }
                            }
                        },
                        '& .MuiInputLabel-root': { 
                            color: '#888',
                            '&.Mui-focused': { color: '#888' },
                            '&.Mui-disabled': { color: '#666' }
                        },
                        '& .MuiOutlinedInput-input': { 
                            color: '#fff',
                            padding: '12px 16px',
                            '&.Mui-disabled': { 
                                color: '#aaa',
                                WebkitTextFillColor: '#aaa'
                            }
                        }
                    }}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Email"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={onChange}
                    disabled={selectedClient !== null}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#4A4747',
                            borderRadius: 1,
                            '& fieldset': { borderColor: '#717171' },
                            '&:hover fieldset': { borderColor: '#717171' },
                            '&.Mui-focused fieldset': { borderColor: '#717171' },
                            '&.Mui-disabled': {
                                backgroundColor: '#3a3a3a',
                                '& fieldset': { borderColor: '#555' }
                            }
                        },
                        '& .MuiInputLabel-root': { 
                            color: '#888',
                            '&.Mui-focused': { color: '#888' },
                            '&.Mui-disabled': { color: '#666' }
                        },
                        '& .MuiOutlinedInput-input': { 
                            color: '#fff',
                            padding: '12px 16px',
                            '&.Mui-disabled': { 
                                color: '#aaa',
                                WebkitTextFillColor: '#aaa'
                            }
                        }
                    }}
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
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#4A4747',
                            borderRadius: 1,
                            '& fieldset': { borderColor: '#717171' },
                            '&:hover fieldset': { borderColor: '#717171' },
                            '&.Mui-focused fieldset': { borderColor: '#717171' },
                            '&.Mui-disabled': {
                                backgroundColor: '#3a3a3a',
                                '& fieldset': { borderColor: '#555' }
                            }
                        },
                        '& .MuiInputLabel-root': { 
                            color: '#888',
                            '&.Mui-focused': { color: '#888' },
                            '&.Mui-disabled': { color: '#666' }
                        },
                        '& .MuiOutlinedInput-input': { 
                            color: '#fff',
                            padding: '12px 16px',
                            '&.Mui-disabled': { 
                                color: '#aaa',
                                WebkitTextFillColor: '#aaa'
                            }
                        }
                    }}
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
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#4A4747',
                            borderRadius: 1,
                            '& fieldset': { borderColor: '#717171' },
                            '&:hover fieldset': { borderColor: '#717171' },
                            '&.Mui-focused fieldset': { borderColor: '#717171' },
                            '&.Mui-disabled': {
                                backgroundColor: '#3a3a3a',
                                '& fieldset': { borderColor: '#555' }
                            }
                        },
                        '& .MuiInputLabel-root': { 
                            color: '#888',
                            '&.Mui-focused': { color: '#888' },
                            '&.Mui-disabled': { color: '#666' }
                        },
                        '& .MuiOutlinedInput-input': { 
                            color: '#fff',
                            padding: '12px 16px',
                            '&.Mui-disabled': { 
                                color: '#aaa',
                                WebkitTextFillColor: '#aaa'
                            }
                        }
                    }}
                />
            </Grid>
        </Grid>
    );
};

export default ClientSection; 