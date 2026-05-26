import React, { useEffect, useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import supplierService from '../../../services/supplierService';

const StatBox = ({ label, value, color }) => (
    <Box sx={{
        flex: 1,
        bgcolor: '#1e1e1e',
        borderRadius: 1,
        px: 1.5,
        py: 1,
        minWidth: 0,
    }}>
        <Typography sx={{ fontSize: '0.6rem', color: '#aaa', fontWeight: 700, letterSpacing: 0.5, mb: 0.3 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color }}>
            ${value.toFixed(2)}
        </Typography>
    </Box>
);

const SupplierPayoutSummary = ({ reservationId, nights, totalAmount }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!reservationId) return;
        let cancelled = false;
        Promise.all([
            supplierService.getReservationSupplier(reservationId),
            supplierService.getSupplierPayments(reservationId),
        ]).then(([assignment, payments]) => {
            if (cancelled || !assignment) return;
            const owed = (assignment.payout_per_night ?? 0) * (nights ?? 0);
            const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const balance = owed - paid;
            const clientTotal = Number(totalAmount) || 0;
            const netMargin = clientTotal - owed;
            const marginPct = clientTotal > 0 ? (netMargin / clientTotal) * 100 : 0;
            setData({ owed, paid, balance, netMargin, marginPct });
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [reservationId, nights, totalAmount]);

    if (!data) return null;

    const { owed, paid, balance, netMargin, marginPct } = data;
    const marginPositive = netMargin >= 0;

    return (
        <Box>
            <Divider sx={{ bgcolor: '#555', my: 2 }} />

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AccountBalanceIcon sx={{ color: '#9b8fef', fontSize: 18 }} />
                <Typography sx={{ color: '#9b8fef', fontWeight: 700, fontSize: '0.85rem' }}>
                    Supplier Payout Summary
                </Typography>
            </Box>

            {/* Stat boxes */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <StatBox label="OWED" value={owed} color="#ffa726" />
                <StatBox label="PAID" value={paid} color="#66bb6a" />
                <StatBox label="BALANCE" value={balance} color={balance > 0 ? '#ef5350' : '#66bb6a'} />
            </Box>

            {/* Net margin banner */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: marginPositive ? 'rgba(102,187,106,0.1)' : 'rgba(239,83,80,0.1)',
                border: `1px solid ${marginPositive ? '#2e7d32' : '#c62828'}`,
                borderRadius: 1,
                px: 1.5,
                py: 1,
            }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#aaa', letterSpacing: 0.5 }}>
                    NET MARGIN (CLIENT – SUPPLIER)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: marginPositive ? '#66bb6a' : '#ef5350' }}>
                        ${netMargin.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: marginPositive ? '#66bb6a' : '#ef5350' }}>
                        {marginPct.toFixed(0)}%
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default SupplierPayoutSummary;
