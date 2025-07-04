import { useMemo } from 'react';

export const useReservationTrends = (reservations) => {
    return useMemo(() => {
        if (!reservations || reservations.length === 0) return [];        // Obtener mes actual y crear fecha base
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Crear array con todos los meses del año actual (enero a diciembre)
        const monthsData = [];
        for (let i = 0; i < 12; i++) {
            // Creamos una fecha para cada mes del año actual
            const targetDate = new Date(currentYear, i, 1);

            monthsData.push({
                date: targetDate,
                isCurrent: i === currentMonth, // Comprobamos si es el mes actual
                label: i === currentMonth ? 'current' : (i === currentMonth - 1 ? 'previous' : 'other')
            });
        }

        // Agrupar reservas por mes
        const monthlyData = {};

        // Inicializar los 12 meses con 0 reservas
        monthsData.forEach(({ date, isCurrent }) => {
            const monthKey = date.toISOString().slice(0, 7);
            monthlyData[monthKey] = {
                date: date,
                month: monthKey,
                reservations: 0,
                revenue: 0,
                isCurrentMonth: isCurrent
            };
        });

        // Contar reservas y sumar ingresos por mes
        reservations.forEach(reservation => {
            const checkInDate = new Date(reservation.check_in_date);
            const monthYear = checkInDate.toISOString().slice(0, 7);

            if (monthlyData[monthYear]) {
                monthlyData[monthYear].reservations++;
                const price = parseFloat(reservation.total_amount || reservation.total_price || 0);
                monthlyData[monthYear].revenue += isNaN(price) ? 0 : price;
            }
        });

        // Convertir a array y ordenar por fecha
        const dataArray = Object.values(monthlyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        return dataArray.map((item) => {
            const prevMonth = dataArray[dataArray.indexOf(item) - 1];
            let percentageChange = null;

            if (prevMonth) {
                if (prevMonth.reservations === 0 && item.reservations > 0) {
                    percentageChange = 'NEW';
                } else if (prevMonth.reservations === 0 && item.reservations === 0) {
                    percentageChange = 'NO DATA';
                } else if (item.reservations === 0) {
                    percentageChange = '-100.0';
                } else {
                    const change = ((item.reservations - prevMonth.reservations) / prevMonth.reservations * 100).toFixed(1);
                    percentageChange = change;
                }
            }

            return {
                month: item.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                }),
                reservations: item.reservations,
                revenue: item.revenue.toFixed(2),
                percentageChange: percentageChange,
                isCurrentMonth: item.isCurrentMonth
            };
        });
    }, [reservations]);
}; 