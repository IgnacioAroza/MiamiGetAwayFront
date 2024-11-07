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
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchReviews, deleteReview } from '../../redux/reviewSlice';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
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
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reviews) && reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{`${review.name} ${review.lastname}`}</TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                </TableCell>
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