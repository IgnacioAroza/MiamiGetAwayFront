import React from "react";
import { Box, Typography, Grid, Divider } from "@mui/material";

const ReservationPaymentSummary = ({ formData }) => {
  const nights = formData.nights || 0;
  const pricePerNight = formData.price || 0;
  const cleaningFee = formData.cleaningFee || 0;
  const parkingFee = formData.parkingFee || 0;
  const otherExpenses = formData.otherExpenses || 0;
  const taxes = formData.taxes || 0;
  const cancellationFee = formData.cancellationFee || 0;
  const totalAmount = formData.totalAmount || 0;
  const amountPaid = formData.amountPaid || 0;
  const amountDue = formData.amountDue || 0;

  const accommodationTotal = nights * pricePerNight;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={1.2}>
        <Grid item xs={8}>
          <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
            {nights} nights × ${pricePerNight.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ color: "#fff", textAlign: "right" }}>
            ${accommodationTotal.toFixed(2)}
          </Typography>
        </Grid>

        {cleaningFee > 0 && (
          <>
            <Grid item xs={8}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                Cleaning Fee
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: "#fff", textAlign: "right" }}>
                ${cleaningFee.toFixed(2)}
              </Typography>
            </Grid>
          </>
        )}

        {parkingFee > 0 && (
          <>
            <Grid item xs={8}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                Parking Fee
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: "#fff", textAlign: "right" }}>
                ${parkingFee.toFixed(2)}
              </Typography>
            </Grid>
          </>
        )}

        {otherExpenses > 0 && (
          <>
            <Grid item xs={8}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                Other Expenses
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: "#fff", textAlign: "right" }}>
                ${otherExpenses.toFixed(2)}
              </Typography>
            </Grid>
          </>
        )}

        <Grid item xs={8}>
          <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
            Taxes
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ color: "#fff", textAlign: "right" }}>
            ${taxes.toFixed(2)}
          </Typography>
        </Grid>

        {cancellationFee > 0 && (
          <>
            <Grid item xs={8}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                Cancellation Fee
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: "#f44336", textAlign: "right" }}>
                -${cancellationFee.toFixed(2)}
              </Typography>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Divider sx={{ bgcolor: "#555", my: 2 }} />
        </Grid>

        <Grid item xs={8}>
          <Typography
            sx={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}
          >
            Total
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            sx={{
              color: "#4caf50",
              textAlign: "right",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            ${totalAmount.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
            Amount Paid
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ color: "#4caf50", textAlign: "right" }}>
            ${amountPaid.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
            Balance Due
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            sx={{
              color: amountDue > 0 ? "#f44336" : "#4caf50",
              textAlign: "right",
              fontWeight: "bold",
            }}
          >
            ${amountDue.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReservationPaymentSummary;
