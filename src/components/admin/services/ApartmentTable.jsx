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
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ApartmentTable = ({ onCreateNew, children }) => {
  const { isMobile } = useDeviceDetection();
  
  // Extraer los datos de las filas de la tabla (los hijos del componente)
  const tableRows = React.Children.toArray(children);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h5" component="h2">
          Apartments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
          fullWidth={isMobile}
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
      
      {isMobile ? (
        // Vista móvil: Cards en lugar de tabla
        <Grid container spacing={2}>
          {tableRows.map((row, index) => {
            // Extraer las celdas de la fila
            const cells = React.Children.toArray(row.props.children);
            
            // Mapear las celdas a sus valores (asumiendo que cada celda tiene un children con el valor)
            const cellValues = cells.map(cell => cell.props.children);
            
            // Asignar valores a variables para mayor claridad
            const [name, description, address, capacity, bathrooms, bedrooms, price, images, actions] = cellValues;
            
            return (
              <Grid item xs={12} key={index}>
                <Card sx={{ bgcolor: '#1e1e1e' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{name}</Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {address}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip label={`${capacity} huéspedes`} size="small" />
                      <Chip label={`${bedrooms} habitaciones`} size="small" />
                      <Chip label={`${bathrooms} baños`} size="small" />
                    </Box>
                    
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${price}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {actions}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        // Vista desktop: Tabla completa
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
              {children}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ApartmentTable;