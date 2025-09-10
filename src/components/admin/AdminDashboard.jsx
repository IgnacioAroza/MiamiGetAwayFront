import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Snackbar,
  Alert,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Summarize as SummarizeIcon,
  Apartment as ApartmentIcon,
} from "@mui/icons-material";

// Componentes
import DashboardCards from "./dashboard/DashboardCards";
import MonthlySummary from "./dashboard/MonthlySummary";
import BookingTrendsChart from "./dashboard/BookingTrendsChart";

// Redux actions
import { fetchUsers, selectUserCount } from "../../redux/userSlice";

import { fetchReservations } from "../../redux/reservationSlice";
import { fetchAllPayments } from "../../redux/reservationPaymentSlice";
import { fetchReviews } from "../../redux/reviewSlice";
import adminApartmentService from "../../services/adminApartmentService";
import useDeviceDetection from "../../hooks/useDeviceDetection";

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetection();
  const [activeTab, setActiveTab] = useState(0);

  // Estados locales
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [buildingNames, setBuildingNames] = useState({});

  // Selectores de Redux
  const userError = useSelector((state) => state.users.error);
  const reviewError = useSelector((state) => state.reviews.error);
  const { reservations } = useSelector((state) => state.reservations);
  const payments = useSelector((state) => state.reservationPayments.payments);
  const reservationsLoading = useSelector((state) => state.reservations.loading);
  const usersStatus = useSelector((state) => state.users.status);
  const paymentsLoading = useSelector((state) => state.reservationPayments.loading);
  const totalUsers = useSelector(selectUserCount);
  const reviews = useSelector((state) => state.reviews.items);

  // Cálculos memorizados
  const stats = useMemo(
    () => ({
      totalUsers,
      totalApartments: apartments.length,
      totalReservations: reservations?.length || 0,
      totalPayments: payments?.length || 0,
      totalReviews: reviews?.length || 0,
      totalRevenue: payments
        ? payments.reduce((total, payment) => {
            const amount = parseFloat(payment?.amount || 0);
            return total + (isNaN(amount) ? 0 : amount);
          }, 0)
        : 0,
    }),
    [
      totalUsers,
      apartments.length,
      reservations?.length,
      payments,
      reviews?.length,
    ]
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchReservations({}));
    dispatch(fetchAllPayments());
    dispatch(fetchReviews());
    loadApartments();
  }, [dispatch]);

  // Cargar apartamentos para obtener los nombres
  const loadApartments = async () => {
    try {
      const apartmentList = await adminApartmentService.getAllApartments();
      setApartments(apartmentList);

      const namesMap = {};
      apartmentList.forEach((apt) => {
        const idKey = String(apt.id);
        const buildingName = apt.building_name || apt.name || "Sin nombre";
        const unitNumber = apt.unit_number
          ? ` - Unidad ${apt.unit_number}`
          : "";
        namesMap[idKey] = buildingName + unitNumber;
      });
      setBuildingNames(namesMap);
    } catch (error) {
      console.error("Error al cargar apartamentos:", error);
      setOpenSnackbar(true);
    }
  };

  // Obtener las últimas 3 reservas ordenadas por fecha
  const getLatestReservations = () => {
    if (!reservations || reservations.length === 0) return [];

    return [...reservations]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.check_in_date) -
          new Date(a.created_at || a.check_in_date)
      )
      .slice(0, 3);
  };

  // Obtener nombre del apartamento
  const getBuildingName = (reservation) => {
    const apartmentId = reservation.apartment_id;
    return apartmentId ? buildingNames[String(apartmentId)] || "N/A" : "N/A";
  };

  // Effects
  useEffect(() => {
    const hasError = userError || reviewError;
    if (hasError) {
      setOpenSnackbar(true);
    }
  }, [userError, reviewError]);

  // Handlers
  const handleCardClick = (path) => navigate(path);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Obtener las últimas reservas
  const latestReservations = getLatestReservations();

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<TrendingUpIcon />} label="Overview" iconPosition="start" />
        <Tab
          icon={<SummarizeIcon />}
          label="Monthly Summary"
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 ? (
        <>
          <Grid container spacing={4}>
            {!isMobile && (
              <Grid item xs={12} md={8}>
                {reservationsLoading ? (
                  <Paper sx={{ p: 3 }}>
                    <Skeleton variant="text" width={220} height={36} />
                    <Skeleton variant="rectangular" height={280} sx={{ mt: 2 }} />
                  </Paper>
                ) : (
                  <BookingTrendsChart reservations={reservations} />
                )}
              </Grid>
            )}

            {isMobile && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Trend charts are available in the desktop version for better
                    viewing.
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={isMobile ? 12 : 4}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="h5" component="h2">
                    Latest Bookings
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/admin/reservations")}
                  >
                    See all
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {reservationsLoading ? (
                    [...Array(3)].map((_, idx) => (
                      <ListItem key={idx} sx={{ mb: 1 }}>
                        <ListItemIcon>
                          <Skeleton variant="circular" width={24} height={24} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Skeleton variant="text" width="60%" />}
                          secondary={<Skeleton variant="text" width="40%" />}
                        />
                      </ListItem>
                    ))
                  ) : latestReservations.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No reservations available" />
                    </ListItem>
                  ) : (
                    latestReservations.map((reservation) => (
                      <ListItem
                        key={reservation.id}
                        sx={{
                          mb: 1,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: "4px",
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <ListItemIcon>
                          <ApartmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={getBuildingName(reservation)}
                          secondary={`${reservation.client_name || "Client"}, ${
                            reservation.client_lastname || "Lastname"
                          } · ${formatDate(
                            reservation.check_in_date
                          )} to ${formatDate(reservation.check_out_date)}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <DashboardCards stats={stats} onCardClick={handleCardClick} />
            </Grid>
          </Grid>
        </>
      ) : !isMobile ? (
        <MonthlySummary />
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Trend charts are available in the desktop version for better
            viewing.
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {userError || reviewError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default AdminDashboard;
