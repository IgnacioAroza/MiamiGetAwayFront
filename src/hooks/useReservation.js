import { useDispatch, useSelector } from 'react-redux';
import {
    fetchReservations,
    createReservation,
    updateReservation,
    registerPayment,
    generateReservationPdf,
    sendReservationConfirmation
} from '../redux/reservationSlice';

export const useReservation = () => {
    const dispatch = useDispatch();
    const {
        reservations,
        selectedReservation,
        loading,
        error
    } = useSelector(state => state.reservations);

    const handleCreateReservation = (data) => {
        return dispatch(createReservation(data));
    };

    const handleUpdateReservation = (id, data) => {
        return dispatch(updateReservation({ id, reservationData: data }));
    };

    const handleRegisterPayment = (reservationId, paymentData) => {
        return dispatch(registerPayment({ id: reservationId, paymentData }));
    };

    const handleGeneratePdf = (reservationId, email) => {
        return dispatch(generateReservationPdf({ id: reservationId, email }));
    };

    const handleSendConfirmation = (reservationId) => {
        return dispatch(sendReservationConfirmation(reservationId));
    };

    return {
        reservations,
        selectedReservation,
        loading,
        error,
        handleCreateReservation,
        handleUpdateReservation,
        handleRegisterPayment,
        handleGeneratePdf,
        handleSendConfirmation
    };
};
