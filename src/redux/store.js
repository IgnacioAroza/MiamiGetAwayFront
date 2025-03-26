import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './serviceSlice';
import userReducer from './userSlice';
import reviewsReducer from './reviewSlice'
import adminApartmentReducer from './adminApartmentSlice';
import reservationReducer from './reservationSlice';
import reservationPaymentReducer from './reservationPaymentSlice';

export const store = configureStore({
    reducer: {
        services: servicesReducer,
        users: userReducer,
        reviews: reviewsReducer,
        adminApartments: adminApartmentReducer,
        reservations: reservationReducer,
        reservationPayments: reservationPaymentReducer,
    },
});