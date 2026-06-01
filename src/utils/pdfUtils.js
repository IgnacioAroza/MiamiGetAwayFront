import api from './api'

export const downloadReservationPdf = async (id) => {
    const reservationResponse = await api.get(`/reservations/${id}`);
    const reservationData = reservationResponse.data;

    const queryParams = new URLSearchParams();
    queryParams.append('format', 'pdf');
    queryParams.append('include_details', 'true');

    if (reservationData.client_name || reservationData.clientName) {
        queryParams.append('client_name', reservationData.client_name || reservationData.clientName);
    }

    if (reservationData.check_in_date || reservationData.checkInDate) {
        queryParams.append('check_in_date', reservationData.check_in_date || reservationData.checkInDate);
    }

    const response = await api.get(`/reservations/${id}/pdf/download?${queryParams.toString()}`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `reservation-${id}-${reservationData.clientLastname}-${reservationData.clientName}.pdf`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return blobUrl;
}
