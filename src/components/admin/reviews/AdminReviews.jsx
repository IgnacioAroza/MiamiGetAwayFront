import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Skeleton,
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchReviews, deleteReview } from '../../../redux/reviewSlice';

const AdminReviews = () => {
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.items);
  const status = useSelector(state => state.reviews.status);
  const error = useSelector(state => state.reviews.error);

  const [openModal, setOpenModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchReviews());
    }
  }, [status, dispatch]);

  const handleOpenModal = (id) => {
    setReviewToDelete(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReviewToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDelete) {
      try {
        await dispatch(deleteReview(reviewToDelete)).unwrap();
        handleCloseModal();
      } catch (err) {
        console.error('Failed to delete the review: ', err);
      }
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Name','Comment','Actions'].map((h) => (
                  <TableCell key={h}><Skeleton variant="text" width={120} /></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton variant="text" width={160} /></TableCell>
                  <TableCell><Skeleton variant="text" width={320} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={28} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Typography color="error" align="center">
        Error: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Reviews
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reviews) && reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{`${review.name}`}</TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenModal(review.id)}
                    color="error"
                    size="small"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm to delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this review?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
