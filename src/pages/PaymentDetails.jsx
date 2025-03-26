import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentById } from '../redux/reservationPaymentSlice';
import { CircularProgress, Typography, Container } from '@mui/material';
import PaymentDetails from '../components/payments/PaymentDetails';

const PaymentDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const payment = useSelector(state => state.reservationPayments.selectedPayment);
    const loading = useSelector(state => state.reservationPayments.loading);

    useEffect(() => {
        if (id) {
            dispatch(fetchPaymentById(id));
        }
    }, [id, dispatch]);

    if (loading) return <CircularProgress />;
    if (!payment) return <Typography>Payment not found</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <PaymentDetails payment={payment} />
        </Container>
    );
};

export default PaymentDetailsPage;
