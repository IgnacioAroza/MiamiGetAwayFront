import api from '../utils/api';

class SalesVolumeService {
    /**
     * Obtiene el reporte de volumen de ventas
     * @param {string} from - Fecha desde (YYYY-MM-DD)
     * @param {string} to - Fecha hasta (YYYY-MM-DD)
     * @param {string} groupBy - Agrupación: 'day' | 'month' | 'year' (default: 'month')
     * @returns {Promise} Respuesta del API
     */
    async getSalesVolume(from, to, groupBy = 'month') {
        try {
            const params = new URLSearchParams({
                from,
                to,
                groupBy
            });

            const response = await api.get(`/summaries/sales-volume?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching sales volume:', error);
            throw error;
        }
    }

    /**
     * Genera rangos de fechas predefinidos
     */
    getQuickDateRanges() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        return {
            lastMonth: {
                from: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
                to: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
                label: 'Last Month',
                groupBy: 'day'
            },
            currentMonth: {
                from: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
                to: today.toISOString().split('T')[0],
                label: 'Current Month',
                groupBy: 'day'
            },
            lastQuarter: {
                from: new Date(currentYear, Math.floor(currentMonth / 3) * 3 - 3, 1).toISOString().split('T')[0],
                to: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 0).toISOString().split('T')[0],
                label: 'Last Quarter',
                groupBy: 'month'
            },
            currentQuarter: {
                from: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1).toISOString().split('T')[0],
                to: today.toISOString().split('T')[0],
                label: 'Current Quarter',
                groupBy: 'month'
            },
            lastYear: {
                from: new Date(currentYear - 1, 0, 1).toISOString().split('T')[0],
                to: new Date(currentYear - 1, 11, 31).toISOString().split('T')[0],
                label: 'Last Year',
                groupBy: 'month'
            },
            currentYear: {
                from: new Date(currentYear, 0, 1).toISOString().split('T')[0],
                to: today.toISOString().split('T')[0],
                label: 'Current Year',
                groupBy: 'month'
            }
        };
    }

    /**
     * Formatea el período para mostrar en el gráfico
     * @param {string} period - Período del API
     * @param {string} groupBy - Tipo de agrupación
     * @returns {string} Período formateado
     */
    formatPeriod(period, groupBy) {
        const date = new Date(period);

        switch (groupBy) {
            case 'day':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            case 'month':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                });
            case 'year':
                return date.getFullYear().toString();
            default:
                return period;
        }
    }

    /**
     * Calcula estadísticas adicionales
     * @param {Array} series - Serie de datos del API
     * @returns {Object} Estadísticas calculadas
     */
    calculateStats(series) {
        if (!series || series.length === 0) {
            return {
                averageRevenue: 0,
                averagePayments: 0,
                bestPeriod: null,
                growthRate: 0
            };
        }

        const totalRevenue = series.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const totalPayments = series.reduce((sum, item) => sum + (item.totalPayments || 0), 0);

        const averageRevenue = totalRevenue / series.length;
        const averagePayments = totalPayments / series.length;

        // Encontrar el mejor período
        const bestPeriod = series.reduce((best, current) =>
            (current.totalRevenue > (best.totalRevenue || 0)) ? current : best
        );

        // Calcular crecimiento (comparar primeros vs últimos períodos)
        let growthRate = 0;
        if (series.length >= 2) {
            const firstHalf = series.slice(0, Math.floor(series.length / 2));
            const secondHalf = series.slice(Math.floor(series.length / 2));

            const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) / secondHalf.length;

            if (firstHalfAvg > 0) {
                growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
            }
        }

        return {
            averageRevenue,
            averagePayments,
            bestPeriod,
            growthRate
        };
    }
}

export default new SalesVolumeService();
