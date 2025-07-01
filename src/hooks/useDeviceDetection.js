import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Hook personalizado para detectar el tipo de dispositivo basado en el ancho de pantalla
 * 
 * @returns {Object} Objeto con propiedades booleanas que indican el tipo de dispositivo
 * - isMobile: true si el ancho de pantalla es menor que 'sm' (600px por defecto en MUI)
 * - isTablet: true si el ancho de pantalla está entre 'sm' y 'md' (600px-900px por defecto)
 * - isDesktop: true si el ancho de pantalla es mayor que 'md' (900px por defecto)
 */
const useDeviceDetection = () => {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return {
        isMobile,
        isTablet,
        isDesktop
    };
};

export default useDeviceDetection;
