import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './serviceSlice';
import userReducer from './userSlice';
import reviewReducer from './reviewSlice';
import googleReviewReducer from './googleReviewSlice';
import adminApartmentReducer from './adminApartmentSlice';
import reservationReducer from './reservationSlice';
import reservationPaymentReducer from './reservationPaymentSlice';
import summaryReducer from './summarySlice';
import supplierReducer from './supplierSlice';
import investmentReducer from './investmentSlice';
import experienceReducer from './experienceSlice';
import experienceInquiryReducer from './experienceInquirySlice';

export const store = configureStore({
    reducer: {
        services: servicesReducer,
        users: userReducer,
        reviews: reviewReducer,
        googleReviews: googleReviewReducer,
        adminApartments: adminApartmentReducer,
        reservations: reservationReducer,
        reservationPayments: reservationPaymentReducer,
        summary: summaryReducer,
        suppliers: supplierReducer,
        investments: investmentReducer,
        experiences: experienceReducer,
        experienceInquiries: experienceInquiryReducer,
    },
});

export default store;