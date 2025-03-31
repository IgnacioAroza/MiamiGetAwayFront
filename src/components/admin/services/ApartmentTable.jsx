import React from 'react';
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ApartmentTable = ({ onCreateNew }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Apartments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
          sx={{
            bgcolor: '#2196f3',
            '&:hover': {
              bgcolor: '#1976d2'
            }
          }}
        >
          CREAR NUEVO
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Bathrooms</TableCell>
              <TableCell>Bedrooms</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Table content will be passed as children */}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ApartmentTable; 