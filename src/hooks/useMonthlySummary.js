import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    generateSummary,
    downloadSummaryPDF,
    sendSummaryEmail,
    clearError,
    clearSuccess
} from '../redux/summarySlice';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const useMonthlySummary = () => {
    const dispatch = useDispatch();
    const { currentSummary, loading, error, success, pdfDownloading, emailSending } = useSelector(state => state.summary);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        dispatch(generateSummary({ month: selectedMonth, year: selectedYear }));
    }, [dispatch, selectedMonth, selectedYear]);

    const handleMonthChange = (newMonth) => {
        setSelectedMonth(newMonth);
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
    };

    const handleGenerateSummary = () => {
        dispatch(generateSummary({ month: selectedMonth, year: selectedYear }));
    };

    const handleDownloadPDF = () => {
        dispatch(downloadSummaryPDF({ year: selectedYear, month: selectedMonth }));
    };

    const handleSendEmail = () => {
        dispatch(sendSummaryEmail({ year: selectedYear, month: selectedMonth }));
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    const handleClearSuccess = () => {
        dispatch(clearSuccess());
    };

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i), 'MMMM', { locale: enUS })
    }));

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return {
        currentSummary,
        loading,
        error,
        success,
        pdfDownloading,
        emailSending,
        selectedMonth,
        selectedYear,
        months,
        years,
        handleMonthChange,
        handleYearChange,
        handleGenerateSummary,
        handleDownloadPDF,
        handleSendEmail,
        handleClearError,
        handleClearSuccess
    };
}; 