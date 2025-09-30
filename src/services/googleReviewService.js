import api from '../utils/api';

const googleReviewService = {
    /**
     * Obtiene reviews desde Google Business Profile almacenadas localmente
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.limit - Cantidad de reviews por página (default: 50)
     * @param {number} params.offset - Desplazamiento para paginación (default: 0)
     * @returns {Promise} Promise con la respuesta de la API
     */
    getGoogleReviews: async ({ limit = 50, offset = 0 } = {}) => {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString()
            });

            const response = await api.get(`/google-mybusiness/reviews?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Google Business reviews:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            throw error;
        }
    },

    /**
     * Obtiene el URL del negocio en Google Maps para que el usuario pueda agregar una review
     * Este método podría expandirse para obtener el link dinámicamente desde el backend
     * @returns {string} URL del negocio en Google Maps
     */
    getGoogleMapsReviewUrl: () => {
        // TODO: Este URL debería venir del backend o configuración
        // Por ahora retornamos un placeholder que deberás actualizar con tu negocio real
        return 'https://www.google.com.ar/maps/place/Miami+Get+Away/@25.9961587,-80.1456513,17z/data=!3m1!4b1!4m6!3m5!1s0x6a6b393aab0201e1:0xf5eb3c5357b49070!8m2!3d25.9961587!4d-80.1430764!16s%2Fg%2F11x8t6qxvm?entry=ttu&g_ep=EgoyMDI1MDkyNC4wIKXMDSoASAFQAw%3D%3D';
    },

    /**
     * Redirige al usuario a Google Maps para escribir una review
     */
    redirectToGoogleReview: () => {
        const url = googleReviewService.getGoogleMapsReviewUrl();
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

export default googleReviewService;