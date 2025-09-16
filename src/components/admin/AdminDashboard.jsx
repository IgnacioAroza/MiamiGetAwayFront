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
  BarChart as BarChartIcon,
} from "@mui/icons-material";

// Componentes
import MonthlySummary from "./dashboard/MonthlySummary";
import BookingTrendsChart from "./dashboard/BookingTrendsChart";
import SalesVolumeChart from "./dashboard/SalesVolumeChart";

// Redux actions
import { fetchUsers, selectUserCount } from "../../redux/userSlice";

import { fetchReservations } from "../../redux/reservationSlice";
import { fetchAllPayments } from "../../redux/reservationPaymentSlice";
import { fetchReviews } from "../../redux/reviewSlice";
import adminApartmentService from "../../services/adminApartmentService";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import { normalizeReservationFromApi, normalizeApartmentFromApi } from "../../utils/normalizers";

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

  // Selectores de Redux con normalización
  const userError = useSelector((state) => state.users.error);
  const reviewError = useSelector((state) => state.reviews.error);
  const rawReservations = useSelector((state) => state.reservations.reservations);
  const reservations = useMemo(() => {
    if (!rawReservations || rawReservations.length === 0) return [];
    return rawReservations.map(reservation => normalizeReservationFromApi(reservation));
  }, [rawReservations]);
  const payments = useSelector((state) => state.reservationPayments.payments);
  const reservationsLoading = useSelector((state) => state.reservations.loading);
  const usersStatus = useSelector((state) => state.users.status);
  const paymentsLoading = useSelector((state) => state.reservationPayments.loading);
  const totalUsers = useSelector(selectUserCount);
  const reviews = useSelector((state) => state.reviews.items);

  // Cálculos memorizados
  const latestReservations = useMemo(() => {
    if (!reservations || reservations.length === 0) return [];

    return [...reservations]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.checkInDate) -
          new Date(a.createdAt || a.checkInDate)
      )
      .slice(0, 3);
  }, [reservations]);

  // Obtener las próximas reservas
  const upcomingReservations = useMemo(() => {
    if (!reservations || reservations.length === 0) return [];

    const now = new Date();
    return [...reservations]
      .filter(reservation => {
        const checkInDate = new Date(reservation.checkInDate);
        return checkInDate >= now;
      })
      .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))
      .slice(0, 3);
  }, [reservations]);

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
      // Normalizar los apartamentos también
      const normalizedApartments = apartmentList.map(apt => normalizeApartmentFromApi(apt));
      setApartments(normalizedApartments);

      const namesMap = {};
      normalizedApartments.forEach((apt) => {
        const idKey = String(apt.id);
        const buildingName = apt.name || "Sin nombre";
        const unitNumber = apt.unitNumber
          ? ` - Unidad ${apt.unitNumber}`
          : "";
        namesMap[idKey] = buildingName + unitNumber;
      });
      setBuildingNames(namesMap);
    } catch (error) {
      console.error("Error al cargar apartamentos:", error);
      setOpenSnackbar(true);
    }
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

  // Obtener nombre del apartamento
  const getBuildingName = (reservation) => {
    const apartmentId = reservation.apartmentId;
    return apartmentId ? buildingNames[String(apartmentId)] || "N/A" : "N/A";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<TrendingUpIcon />} label="Overview" iconPosition="start" />
        <Tab icon={<BarChartIcon />} label="Sales Volume" iconPosition="start" />
        <Tab
          icon={<SummarizeIcon />}
          label="Monthly Summary"
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 ? (
        <>
          <Grid container spacing={4}>
            {/* Gráfico principal - más ancho */}
            {!isMobile && (
              <Grid item xs={12} md={12}>
                {reservationsLoading ? (
                  <Paper sx={{ p: 3 }}>
                    <Skeleton variant="text" width={220} height={36} />
                    <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
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

            {/* Latest Bookings */}
            <Grid item xs={12} md={isMobile ? 12 : 6}>
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
                          secondary={`${reservation.clientName || "Client"}, ${
                            reservation.clientLastname || "Lastname"
                          } · ${formatDate(
                            reservation.checkInDate
                          )} to ${formatDate(reservation.checkOutDate)}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Upcoming Check-ins */}
            <Grid item xs={12} md={6}>
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
                    Upcoming Check-ins
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
                  ) : upcomingReservations.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No upcoming check-ins" />
                    </ListItem>
                  ) : (
                    upcomingReservations.map((reservation) => (
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
                          <ApartmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={getBuildingName(reservation)}
                          secondary={`${reservation.clientName || "Client"}, ${
                            reservation.clientLastname || "Lastname"
                          } · Check-in: ${formatDate(reservation.checkInDate)}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : activeTab === 1 ? (
        <SalesVolumeChart />
      ) : !isMobile ? (
        <MonthlySummary />
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Monthly summary charts are available in the desktop version for better
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
