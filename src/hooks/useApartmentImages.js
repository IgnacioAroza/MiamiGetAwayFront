export const useApartmentImages = (apartment) => {
    const getApartmentImage = () => {
        if (apartment && apartment.images && apartment.images.length > 0) {
            return apartment.images[0];
        }
        return 'https://via.placeholder.com/150?text=No+Image';
    };

    const getApartmentDetails = () => {
        if (!apartment) return null;

        return {
            name: apartment.name || '',
            unitNumber: apartment.unitNumber || '',
            capacity: apartment.capacity || 0,
            price: apartment.price || 0,
            image: getApartmentImage(),
            alt: apartment.building_name || apartment.name || 'Apartment'
        };
    };

    return {
        getApartmentImage,
        getApartmentDetails
    };
}; 