import React, { useEffect, useState } from 'react';
import {
    Box, Chip, CircularProgress, MenuItem, Paper, Select, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
    Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
    fetchAllInquiries, updateInquiryStatus,
    selectAllInquiries, selectInquiriesStatus, selectInquiriesPagination,
} from '../../../redux/experienceInquirySlice';

const STATUS_COLORS = {
    pending: { bgcolor: '#1a3a1a', color: '#66bb6a', border: '#2a5a2a' },
    contacted: { bgcolor: '#1a2a3a', color: '#4fc3f7', border: '#2a4a6a' },
    closed: { bgcolor: '#2a2a2a', color: '#888', border: '#3a3a3a' },
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

const InquiryList = () => {
    const dispatch = useDispatch();
    const inquiries = useSelector(selectAllInquiries);
    const status = useSelector(selectInquiriesStatus);
    const pagination = useSelector(selectInquiriesPagination);
    const [updating, setUpdating] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchAllInquiries({ page: page + 1, limit: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(id);
        try {
            await dispatch(updateInquiryStatus({ id, status: newStatus })).unwrap();
        } finally {
            setUpdating(null);
        }
    };

    if (status === 'loading') {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Contact', 'Experience', 'Phone', 'Status', 'Date'].map(h => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[180, 160, 120, 100, 120].map((w, j) => (
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
                <Typography variant="h4">Inquiries</Typography>
                {inquiries.length > 0 && (
                    <Chip
                        label={inquiries.filter(i => i.status === 'pending').length + ' pending'}
                        size="small"
                        sx={{ bgcolor: '#1a3a1a', color: '#66bb6a', border: '1px solid #2a5a2a', ml: 1 }}
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
                                <TableCell>Experience</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
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
                                            {inq.name} {inq.lastname}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#777' }}>
                                            {inq.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {inq.experience_title ? (
                                            <Typography variant="body2">{inq.experience_title}</Typography>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic' }}>
                                                General inquiry
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: inq.phone ? '#ddd' : '#555' }}>
                                            {inq.phone || '—'}
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
                                                <MenuItem value="pending" sx={{ color: '#66bb6a' }}>pending</MenuItem>
                                                <MenuItem value="contacted" sx={{ color: '#4fc3f7' }}>contacted</MenuItem>
                                                <MenuItem value="closed" sx={{ color: '#888' }}>closed</MenuItem>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: '#777', whiteSpace: 'nowrap' }}>
                                            {new Date(inq.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                            })}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={pagination?.total ?? inquiries.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Rows per page:"
                    />
                </TableContainer>
            )}
        </Box>
    );
};

export default InquiryList;
