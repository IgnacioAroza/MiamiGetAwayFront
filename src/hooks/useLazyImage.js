import { useState, useEffect, useRef, useMemo } from 'react';

const useLazyImage = (src, options = {}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();

    const { root = null, rootMargin = '50px', threshold = 0.1 } = options;

    const observerOptions = useMemo(() => ({
        root,
        rootMargin,
        threshold,
    }), [root, rootMargin, threshold]);

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