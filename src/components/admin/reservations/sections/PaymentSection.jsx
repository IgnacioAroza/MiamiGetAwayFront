import React from 'react';
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const PaymentSection = ({ formData, onChange }) => {
    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Amount"
                        name="paymentAmount"
                        type="number"
                        placeholder="$0.00"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1a1a1a',
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#777' },
                                '&.Mui-focused fieldset': { borderColor: '#90caf9' },
                            },
                            '& .MuiInputLabel-root': { color: '#ccc' },
                            '& .MuiOutlinedInput-input': { color: '#fff' },
                        }}
                    />
                </Grid>
                
                <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#ccc' }}>Method</InputLabel>
                        <Select
                            name="paymentMethod"
                            defaultValue="cash"
                            label="Method"
                            sx={{
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' },
                                '& .MuiSvgIcon-root': { color: '#ccc' },
                            }}
                        >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="transfer">Transfer</MenuItem>
                            <MenuItem value="check">Check</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Payment Notes"
                        name="paymentNotes"
                        multiline
                        rows={2}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1a1a1a',
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#777' },
                                '&.Mui-focused fieldset': { borderColor: '#90caf9' },
                            },
                            '& .MuiInputLabel-root': { color: '#ccc' },
                            '& .MuiOutlinedInput-input': { color: '#fff' },
                        }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="medium"
                        sx={{
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' },
                            fontWeight: 'bold',
                            py: 1.5
                        }}
                    >
                        Register Payment
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PaymentSection; 