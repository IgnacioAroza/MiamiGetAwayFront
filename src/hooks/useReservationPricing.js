import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateReservation, createReservation, registerPayment } from '../redux/reservationSlice';

export const useReservationPricing = (formData, setFormData) => {
    const dispatch = useDispatch();

    // Calcular noches cuando cambian las fechas
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            const checkIn = new Date(formData.checkInDate);
            const checkOut = new Date(formData.checkOutDate);
            const differenceMs = checkOut - checkIn;
            const nights = Math.max(1, Math.round(differenceMs / 86400000));

            setFormData(prev => ({
                ...prev,
                nights
            }));
        }
    }, [formData.checkInDate, formData.checkOutDate, setFormData]);

    // Calcular precios
    useEffect(() => {
        if (formData.nights > 0 && formData.price > 0) {
            const price = Number(formData.price);
            const nights = Number(formData.nights);
            const cleaningFee = Number(formData.cleaningFee) || 0;
            const parkingFee = Number(formData.parkingFee) || 0;
            const otherExpenses = Number(formData.otherExpenses) || 0;
            const amountPaid = Number(formData.amountPaid) || 0;

            const accommodationTotal = price * nights;
            // cancellationFee es un ítem aparte y NO suma al subtotal
            const subtotal = accommodationTotal + cleaningFee + parkingFee + otherExpenses;
            const taxRate = 0.07;

            // Solo calcular taxes si el campo está vacío o undefined
            let taxes;
            if (formData.taxes === '' || formData.taxes === undefined) {
                taxes = subtotal * taxRate;
            } else {
                taxes = Number(formData.taxes);
            }

            const total = subtotal + taxes;
            const due = total - amountPaid;

            let paymentStatus = 'pending';
            if (due <= 0) {
                paymentStatus = 'complete';
            } else if (amountPaid > 0) {
                paymentStatus = 'partial';
            }

            setFormData(prev => ({
                ...prev,
                taxes: formData.taxes === '' ? '' : parseFloat(taxes.toFixed(2)),
                totalAmount: parseFloat(total.toFixed(2)),
                amountDue: parseFloat(due.toFixed(2)),
                paymentStatus
            }));
        }
    }, [
        formData.price,
        formData.nights,
        formData.cleaningFee,
        formData.parkingFee,
        formData.otherExpenses,
        formData.amountPaid,
        formData.taxes,
        setFormData
    ]);

    const handleSubmit = async (id) => {
        try {
            if (!id) {
                // Crear nueva reserva
                const result = await dispatch(createReservation(formData)).unwrap();

                // Si hay un monto pagado, registrar el pago
                if (formData.amountPaid && parseFloat(formData.amountPaid) > 0) {
                    const paymentData = {
                        amount: parseFloat(formData.amountPaid),
                        payment_method: 'cash',
                        notes: 'Initial payment registered during reservation creation',
                        reservation_update: {
                            amount_paid: parseFloat(formData.amountPaid),
                            amount_due: parseFloat(formData.amountDue),
                            payment_status: formData.paymentStatus
                        }
                    };

                    await dispatch(registerPayment({
                        id: result.id,
                        paymentData
                    })).unwrap();
                }
                return result.id;
            } else {
                // Actualizar reserva existente
                const result = await dispatch(updateReservation({
                    id,
                    reservationData: formData
                })).unwrap();

                // Verificar si el monto pagado ha aumentado
                const originalAmountPaid = parseFloat(formData.originalAmountPaid) || 0;
                const newAmountPaid = parseFloat(formData.amountPaid) || 0;

                if (newAmountPaid > originalAmountPaid) {
                    const paymentDifference = newAmountPaid - originalAmountPaid;

                    if (paymentDifference > 0) {
                        const paymentData = {
                            amount: paymentDifference,
                            payment_method: 'cash',
                            notes: 'Additional payment registered during reservation update',
                            reservation_update: {
                                amount_paid: parseFloat(newAmountPaid),
                                amount_due: parseFloat(formData.amountDue),
                                payment_status: formData.paymentStatus
                            }
                        };

                        await dispatch(registerPayment({
                            id,
                            paymentData
                        })).unwrap();
                    }
                }
                return id;
            }
        } catch (error) {
            console.error('Error processing the reservation:', error);
            throw error;
        }
    };

    return {
        handleSubmit
    };
}; 
