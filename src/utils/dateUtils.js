/**
 * Convierte un objeto Date a una cadena con formato MM-DD-YYYY HH:mm
 * @param {Date} date - Objeto Date a formatear
 * @returns {string} - Fecha formateada como MM-DD-YYYY HH:mm
 */
export const formatDateToString = (date) => {
    if (!date) return '';

    // Asegurarse de que date sea un objeto Date
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return '';
    }

    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${month}-${day}-${year} ${hours}:${minutes}`;
};

/**
 * Convierte una cadena con formato MM-DD-YYYY HH:mm a un objeto Date
 * @param {string} dateString - Cadena de fecha en formato MM-DD-YYYY HH:mm o formato ISO
 * @returns {Date|null} - Objeto Date o null si la cadena no es válida
 */
export const parseStringToDate = (dateString) => {
    if (!dateString) return null;

    // Verificar si ya es un objeto Date
    if (dateString instanceof Date) return dateString;

    try {
        // Si es un timestamp o una fecha ISO, intentar convertir directamente
        if (typeof dateString === 'string' && (
            /^\d+$/.test(dateString) || // Es un número (timestamp)
            /^\d{4}-\d{2}-\d{2}/.test(dateString) // Es formato ISO (YYYY-MM-DD)
        )) {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Validar el formato esperado: MM-DD-YYYY HH:mm
        const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}(\s([01][0-9]|2[0-3]):([0-5][0-9]))?$/;
        if (!regex.test(dateString)) {
            // Intentar con formato ISO como último recurso
            const isoDate = new Date(dateString);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }

            return null;
        }

        // Formato esperado: MM-DD-YYYY HH:mm
        const [datePart, timePart] = dateString.split(' ');
        const [month, day, year] = datePart.split('-').map(part => parseInt(part, 10));

        // Si no hay parte de tiempo, asumir 00:00
        let hours = 0, minutes = 0;
        if (timePart) {
            [hours, minutes] = timePart.split(':').map(part => parseInt(part, 10));
        }

        // Crear la fecha sin usar UTC para evitar conversiones de zona horaria
        // Esto preservará la hora tal como se ingresó
        const date = new Date(year, month - 1, day, hours, minutes, 0);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    } catch (error) {
        // Intentar con formato ISO como último recurso
        try {
            const isoDate = new Date(dateString);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }
        } catch (e) {
            // Ignorar error
        }

        return null;
    }
};

/**
 * Calcula la diferencia en días entre dos fechas en formato MM-DD-YYYY HH:mm
 * @param {string} checkInDate - Fecha de entrada en formato MM-DD-YYYY HH:mm
 * @param {string} checkOutDate - Fecha de salida en formato MM-DD-YYYY HH:mm
 * @returns {number} - Número de noches (días) entre las fechas
 */
export const calculateNights = (checkInDate, checkOutDate) => {
    const startDate = parseStringToDate(checkInDate);
    const endDate = parseStringToDate(checkOutDate);

    if (!startDate || !endDate) return 0;

    // Calcular la diferencia en milisegundos y convertir a días
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1; // Mínimo una noche
};

/**
 * Formatea una fecha para mostrarla en la interfaz de usuario
 * @param {string|Date} dateString - Fecha en formato MM-DD-YYYY HH:mm o cualquier formato reconocido por Date
 * @param {boolean} includeTime - Indica si incluir la hora en el formato
 * @param {string} locale - Locale para el formato de la fecha ('en-US' o 'es-ES')
 * @returns {string} - Fecha formateada para mostrar
 */
export const formatDateForDisplay = (dateString, includeTime = true, locale = 'en-US') => {
    if (!dateString) return 'N/A';

    try {
        // Si ya es un objeto Date, usarlo directamente
        let dateObj;
        if (dateString instanceof Date) {
            dateObj = dateString;
        } else {
            // Primero intentar con nuestra función de parsing optimizada
            dateObj = parseStringToDate(dateString);

            // Si falla, intentar crear un objeto Date directamente
            if (!dateObj) {
                dateObj = new Date(dateString);
                if (isNaN(dateObj.getTime())) {
                    return dateString; // Devolver la entrada original si todo falla
                }
            }
        }

        // Configurar opciones de formato
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...(includeTime && {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Usar formato de 24 horas
            })
        };

        // Usar el locale especificado (por defecto inglés)
        return dateObj.toLocaleString(locale, options);
    } catch (error) {
        return dateString; // Devolver la cadena original en caso de error
    }
};

/**
 * Obtener la fecha actual en formato MM-DD-YYYY HH:mm
 * @returns {string} - Fecha actual formateada
 */
export const getCurrentDateFormatted = () => {
    return formatDateToString(new Date());
};

/**
 * Verificar si una cadena tiene el formato correcto MM-DD-YYYY HH:mm
 * @param {string} dateString - Cadena a verificar
 * @returns {boolean} - true si el formato es válido
 */
export const isValidDateFormat = (dateString) => {
    if (!dateString) return false;

    // Formato esperado: MM-DD-YYYY HH:mm
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(dateString);
};