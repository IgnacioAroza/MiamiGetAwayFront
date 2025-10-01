import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Hook personalizado para implementar lazy loading de imágenes con Intersection Observer
 * @param {string} src - URL de la imagen
 * @param {Object} options - Opciones para el Intersection Observer
 * @returns {Object} - Estado y referencia para el lazy loading
 */
const useLazyImage = (src, options = {}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();

    const observerOptions = useMemo(() => ({
        root: null,
        rootMargin: '50px', // Cargar imagen cuando esté a 50px de ser visible
        threshold: 0.1,
        ...options
    }), [options]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    setImageSrc(src);
                    observer.disconnect();
                }
            },
            observerOptions
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [src, observerOptions]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(false);
    };

    return {
        imgRef,
        imageSrc,
        isLoaded,
        isInView,
        hasError,
        handleLoad,
        handleError
    };
};

export default useLazyImage;