import { useState } from 'react';

/**
 * Hook personalizado para manejar errores de carga de imágenes
 * Versión simplificada sin JSX para evitar problemas de bundling
 */
const useImageWithPlaceholder = () => {
    const [imageErrors, setImageErrors] = useState(new Set());

    /**
     * Maneja el error de carga de imagen
     * @param {string} imageId - Identificador único de la imagen
     */
    const handleImageError = (imageId) => {
        setImageErrors(prev => new Set([...prev, imageId]));
    };

    /**
     * Verifica si una imagen tiene error
     * @param {string} imageId - Identificador único de la imagen
     */
    const hasImageError = (imageId) => {
        return imageErrors.has(imageId);
    };

    /**
     * Resetea el estado de error de una imagen específica
     * @param {string} imageId - Identificador único de la imagen
     */
    const resetImageError = (imageId) => {
        setImageErrors(prev => {
            const newSet = new Set(prev);
            newSet.delete(imageId);
            return newSet;
        });
    };

    /**
     * Limpia todos los errores de imagen
     */
    const clearAllErrors = () => {
        setImageErrors(new Set());
    };

    /**
     * Maneja el evento onError de una imagen
     * @param {string} imageId - ID único para trackear errores
     * @param {Function} onError - Callback adicional de error
     */
    const createImageErrorHandler = (imageId, onError) => (e) => {
        handleImageError(imageId);
        if (onError) {
            onError(e);
        }
    };

    /**
     * Maneja el evento onLoad de una imagen
     * @param {string} imageId - ID único para trackear errores
     * @param {Function} onLoad - Callback adicional de carga
     */
    const createImageLoadHandler = (imageId, onLoad) => (e) => {
        // Si la imagen se carga exitosamente, resetear cualquier error previo
        resetImageError(imageId);
        if (onLoad) {
            onLoad(e);
        }
    };

    return {
        handleImageError,
        hasImageError,
        resetImageError,
        clearAllErrors,
        createImageErrorHandler,
        createImageLoadHandler,
        imageErrors: Array.from(imageErrors)
    };
};

export default useImageWithPlaceholder;