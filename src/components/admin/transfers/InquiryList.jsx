import React, { useEffect, useState } from 'react';
import {
    Box, Chip, CircularProgress, MenuItem, Paper, Select, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
    fetchAllTransferInquiries,
    updateTransferInquiryStatus,
    selectAllTransferInquiries,
    selectTransferInquiriesLoading,
} from '../../../redux/transferInquirySlice';

const STATUS_COLORS = {
    pending: { bgcolor: '#3a2a0a', color: '#ffb74d', border: '#5a4a1a' },
    confirmed: { bgcolor: '#1a3a1a', color: '#66bb6a', border: '#2a5a2a' },
    cancelled: { bgcolor: '#3a1a1a', color: '#ef5350', border: '#5a2a2a' },
};

const StatusChip = ({ status }) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: colors.bgcolor,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'capitalize',
                fontWeight: 600,
            }}
        />
    );
};

const TransferInquiryList = () => {
    const dispatch = useDispatch();
    const inquiries = useSelector(selectAllTransferInquiries);
    const loading = useSelector(selectTransferInquiriesLoading);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        dispatch(fetchAllTransferInquiries());
    }, [dispatch]);

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(id);
        try {
            await dispatch(updateTransferInquiryStatus({ id, status: newStatus })).unwrap();
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Contact', 'Vehicle', 'Route', 'Date', 'Service', 'Status'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[180, 140, 160, 100, 120, 100].map((w, j) => (
                                        <TableCell key={j}><Skeleton variant="text" width={w} /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MailOutlineIcon sx={{ color: '#4fc3f7' }} />
                <Typography variant="h4">Transfer Inquiries</Typography>
                {inquiries.length > 0 && (
                    <Chip
                        label={inquiries.filter(i => i.status === 'pending').length + ' pending'}
                        size="small"
                        sx={{ bgcolor: '#3a2a0a', color: '#ffb74d', border: '1px solid #5a4a1a', ml: 1 }}
                    />
                )}
            </Box>

            {inquiries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#666' }}>
                    <MailOutlineIcon sx={{ fontSize: 48, mb: 1, color: '#333' }} />
                    <Typography variant="body1">No inquiries yet.</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { color: '#aaa', fontWeight: 600, borderColor: '#333' } }}>
                                <TableCell>Contact</TableCell>
                                <TableCell>Vehicle</TableCell>
                                <TableCell>Route</TableCell>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>Service</TableCell>
                                <TableCell>Pax / Luggage</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inquiries.map(inq => (
                                <TableRow
                                    key={inq.id}
                                    sx={{ '&:hover': { bgcolor: '#2a2a2a' }, '& td': { borderColor: '#2a2a2a', color: '#ddd' } }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                                            {inq.client_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#777' }}>
                                            {inq.client_email}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                            {inq.client_phone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {inq.vehicle_name ? (
                                            <Typography variant="body2">{inq.vehicle_name}</Typography>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic' }}>
                                                Not specified
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#ddd' }}>
                                            {inq.pick_up}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#777' }}>
                                            → {inq.drop_off}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                            {inq.date}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#777' }}>
                                            {inq.time}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#aaa', textTransform: 'capitalize' }}>
                                            {inq.service_type.replace(/_/g, ' ')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#ddd', whiteSpace: 'nowrap' }}>
                                            {inq.passengers} pax
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#666', whiteSpace: 'nowrap' }}>
                                            L:{inq.luggage_large ?? 0} M:{inq.luggage_medium ?? 0} CO:{inq.luggage_carry_on ?? 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {updating === inq.id ? (
                                            <CircularProgress size={20} sx={{ color: '#4fc3f7' }} />
                                        ) : (
                                            <Select
                                                value={inq.status}
                                                onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                                size="small"
                                                sx={{
                                                    color: STATUS_COLORS[inq.status]?.color || '#ddd',
                                                    bgcolor: STATUS_COLORS[inq.status]?.bgcolor || '#2a2a2a',
                                                    border: `1px solid ${STATUS_COLORS[inq.status]?.border || '#3a3a3a'}`,
                                                    borderRadius: 1,
                                                    '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                                                    '& fieldset': { border: 'none' },
                                                    '& .MuiSvgIcon-root': { color: STATUS_COLORS[inq.status]?.color || '#ddd' },
                                                }}
                                                MenuProps={{ PaperProps: { sx: { bgcolor: '#1e1e1e' } } }}
                                            >
                                                <MenuItem value="pending" sx={{ color: '#ffb74d' }}>pending</MenuItem>
                                                <MenuItem value="confirmed" sx={{ color: '#66bb6a' }}>confirmed</MenuItem>
                                                <MenuItem value="cancelled" sx={{ color: '#ef5350' }}>cancelled</MenuItem>
                                            </Select>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default TransferInquiryList;
