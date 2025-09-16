import React from "react";
import {
  Grid,
  TextField,
} from "@mui/material";

const PricingSection = ({ formData, onChange }) => {
  // Manejar cambios específicos para campos numéricos
  const handleNumericChange = (e) => {
    const { name, value } = e.target;

    // NO forzar conversión a número si el campo está vacío
    let processedValue;

    if (value === "") {
      processedValue = "";
    } else {
      const num = parseFloat(value);
      if (isNaN(num)) {
        processedValue = 0;
      } else {
        // Asegurar que los valores numéricos no sean negativos
        processedValue = Math.max(0, num);
      }
    }

    onChange({
      target: {
        name: name,
        value: processedValue,
      },
    });
  };

  // Manejar el focus para limpiar el valor 0
  const handleFocus = (e) => {
    const { name, value } = e.target;
    if (value === "0" || value === 0) {
      onChange({
        target: {
          name: name,
          value: "",
        },
      });
    }
  };

  // Prevenir submit al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Calcular resumen para mostrar
  const calculateSummary = () => {
    if (formData.nights > 0 && formData.price > 0) {
      const accommodationTotal = formData.nights * formData.price;
      const cleaningFee = Number(formData.cleaningFee) || 0;
      const cancellationFee = Number(formData.cancellationFee) || 0;
      const parkingFee = Number(formData.parkingFee) || 0;
      const otherExpenses = Number(formData.otherExpenses) || 0;
      // cancellationFee es un ítem aparte y NO suma al subtotal
      const subtotal =
        accommodationTotal + cleaningFee + parkingFee + otherExpenses;
      const taxes = Math.max(0, Number(formData.taxes) || 0); // Asegurar que los taxes no sean negativos
      const total = subtotal + taxes;

      return {
        accommodation: accommodationTotal,
        cleaning: cleaningFee,
        cancellation: cancellationFee,
        parking: parkingFee,
        other: otherExpenses,
        subtotal: subtotal,
        taxes: taxes,
        total: total,
      };
    }
    return null;
  };

  const summary = calculateSummary();

  // Estilos comunes para todos los campos
  const fieldStyles = {
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
    },
    '& .MuiInputAdornment-root': {
      color: '#ccc'
    },
    '& .MuiFormHelperText-root': {
      color: '#888'
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}>
        <TextField
          fullWidth
          label="Price per Night"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={3}>
        <TextField
          fullWidth
          label="Nights"
          name="nights"
          type="number"
          value={formData.nights}
          disabled={
            Boolean(formData.checkInDate) && Boolean(formData.checkOutDate)
          }
          onChange={onChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            inputProps: { min: 1 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={3}>
        <TextField
          fullWidth
          label="Cleaning Fee"
          name="cleaningFee"
          type="number"
          value={formData.cleaningFee}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={3}>
        <TextField
          fullWidth
          label="Parking Fee"
          name="parkingFee"
          type="number"
          value={formData.parkingFee}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={4}>
        <TextField
          fullWidth
          label="Other expenses"
          name="otherExpenses"
          type="number"
          value={formData.otherExpenses}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={4}>
        <TextField
          fullWidth
          label="Taxes"
          name="taxes"
          type="number"
          value={formData.taxes}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>

      <Grid item xs={6} md={4}>
        <TextField
          fullWidth
          label="Cancellation Fee"
          name="cancellationFee"
          type="number"
          value={formData.cancellationFee}
          onChange={handleNumericChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: "$",
            inputProps: { min: 0 },
          }}
          sx={fieldStyles}
        />
      </Grid>
    </Grid>
  );
};

export default PricingSection;
