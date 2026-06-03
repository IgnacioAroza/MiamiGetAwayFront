import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TransferDetailPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/transfers', { replace: true });
    }, [navigate]);
    return null;
};

export default TransferDetailPage;
