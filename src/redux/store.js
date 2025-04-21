import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './serviceSlice';
import userReducer from './userSlice';
import reviewReducer from './reviewSlice';
import adminApartmentReducer from './adminApartmentSlice';
import reservationReducer from './reservationSlice';
import reservationPaymentReducer from './reservationPaymentSlice';
import summaryReducer from './summarySlice';

export const store = configureStore({
    reducer: {
        services: servicesReducer,
        users: userReducer,
        reviews: reviewReducer,
        adminApartments: adminApartmentReducer,
        reservations: reservationReducer,
        reservationPayments: reservationPaymentReducer,
        summary: summaryReducer,
    },
});

export default store;