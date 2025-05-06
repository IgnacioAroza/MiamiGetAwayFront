export const useApartmentImages = (apartment) => {
    const getApartmentImage = () => {
        if (apartment && apartment.images && apartment.images.length > 0) {
            return apartment.images[0];
        }
        return 'https://via.placeholder.com/150?text=No+Image';
    };

    const getApartmentDetails = () => {
        if (!apartment) return null;

        const apartmentDetails = {
            name: apartment.name || '',
            unitNumber: apartment.unitNumber || '',
            capacity: apartment.capacity || 0,
            price: parseFloat(apartment.price) || 0, // Asegurarse de que el precio sea un número
            image: getApartmentImage(),
            alt: apartment.building_name || apartment.name || 'Apartment'
        };
        return apartmentDetails;
    };

    return {
        getApartmentImage,
        getApartmentDetails
    };
};