export const useReservationPayments = (formData, setFormData) => {
    const handlePaymentChange = (event) => {
        const { name, value } = event.target;
        const numericValue = parseFloat(value) || 0;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: numericValue
            };

            // Calcular el monto pendiente
            const amountDue = newData.totalAmount - numericValue;

            // Determinar el estado del pago
            let paymentStatus = 'pending';
            if (amountDue <= 0) {
                paymentStatus = 'complete';
            } else if (numericValue > 0) {
                paymentStatus = 'partial';
            }

            return {
                ...newData,
                amountDue: parseFloat(amountDue.toFixed(2)),
                paymentStatus
            };
        });
    };

    const handlePaymentSubmit = async (paymentData) => {
        try {
            // Aquí iría la lógica para enviar el pago al servidor
            // Por ahora solo actualizamos el estado local
            setFormData(prev => ({
                ...prev,
                amountPaid: prev.amountPaid + paymentData.amount,
                amountDue: prev.amountDue - paymentData.amount
            }));

            return { success: true };
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            return { success: false, error: error.message };
        }
    };

    return {
        handlePaymentChange,
        handlePaymentSubmit
    };
}; 