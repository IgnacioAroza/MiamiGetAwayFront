import api from '../utils/api';

const summaryService = {
    // Generar o actualizar resumen mensual
    generateSummary: async (month, year) => {
        try {
            // Primero generamos el resumen
            const generateResponse = await api.post(`/summaries/generate`, { month, year });

            // Luego obtenemos los detalles completos
            const detailsResponse = await api.get(`/summaries/${year}/${month}`);

            return {
                ...generateResponse.data,
                reservations: detailsResponse.data.reservations || [],
                payments: detailsResponse.data.payments || [],
                summary: generateResponse.data.summary || null
            };
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error.response?.data?.message || 'Error generating summary';
        }
    },

    // Obtener detalles del resumen
    getSummaryDetails: async (year, month) => {
        try {
            const response = await api.get(`/summaries/${year}/${month}`);
            return {
                ...response.data,
                reservations: response.data.reservations || [],
                payments: response.data.payments || [],
                summary: response.data.summary || null
            };
        } catch (error) {
            console.error('Error fetching summary details:', error);
            throw error.response?.data?.message || 'Error fetching summary details';
        }
    },

    // Descargar PDF del resumen
    downloadSummaryPDF: async (year, month) => {
        try {
            const response = await api.get(`/summaries/${year}/${month}/pdf`, {
                responseType: 'blob'
            });

            // Crear URL para el blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `monthly-summary-${year}-${month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return true;
        } catch (error) {
            console.error('Error downloading summary PDF:', error);
            throw error.response?.data?.message || 'Error at downloading summary PDF';
        }
    },

    // Enviar resumen por email
    sendSummaryEmail: async (year, month) => {
        try {
            const response = await api.post(`/summaries/${year}/${month}/send`);
            return response.data;
        } catch (error) {
            console.error('Error sending summary email:', error);
            throw error.response?.data?.message || 'Error at sending summary email';
        }
    }
};

export default summaryService; 