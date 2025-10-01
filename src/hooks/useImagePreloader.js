import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para precargar imágenes adyacentes en un carousel
 * @param {Array} images - Array de URLs de imágenes
 * @param {number} currentIndex - Índice actual de la imagen mostrada
 * @returns {Object} - Funciones y estado del preloader
 */
const useImagePreloader = (images, currentIndex) => {
    const preloadedImages = useRef(new Set());
    const imageCache = useRef(new Map());

    const preloadImage = useCallback((src) => {
        return new Promise((resolve, reject) => {
            if (preloadedImages.current.has(src)) {
                resolve(src);
                return;
            }

            const img = new Image();
            img.onload = () => {
                preloadedImages.current.add(src);
                imageCache.current.set(src, img);
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    }, []);

    const preloadAdjacentImages = useCallback((centerIndex) => {
        if (!images || images.length === 0) return;

        const imagesToPreload = [];

        // Imagen anterior
        const prevIndex = centerIndex > 0 ? centerIndex - 1 : images.length - 1;
        if (images[prevIndex]) {
            imagesToPreload.push(images[prevIndex]);
        }

        // Imagen siguiente
        const nextIndex = centerIndex < images.length - 1 ? centerIndex + 1 : 0;
        if (images[nextIndex]) {
            imagesToPreload.push(images[nextIndex]);
        }

        // Imagen actual (por si acaso)
        if (images[centerIndex]) {
            imagesToPreload.push(images[centerIndex]);
        }

        // Precargar todas las imágenes adyacentes
        imagesToPreload.forEach(imageSrc => {
            if (!preloadedImages.current.has(imageSrc)) {
                preloadImage(imageSrc).catch(console.error);
            }
        });
    }, [images, preloadImage]);

    // Efecto para precargar imágenes cuando cambia el índice actual
    useEffect(() => {
        if (images && images.length > 0 && currentIndex >= 0) {
            preloadAdjacentImages(currentIndex);
        }
    }, [images, currentIndex, preloadAdjacentImages]);

    // Precargar la primera imagen al montar el componente
    useEffect(() => {
        if (images && images.length > 0) {
            preloadAdjacentImages(0);
        }
    }, [images, preloadAdjacentImages]);

    const isImagePreloaded = useCallback((src) => {
        return preloadedImages.current.has(src);
    }, []);

    const getPreloadedImage = useCallback((src) => {
        return imageCache.current.get(src);
    }, []);

    return {
        preloadImage,
        preloadAdjacentImages,
        isImagePreloaded,
        getPreloadedImage
    };
};

export default useImagePreloader;