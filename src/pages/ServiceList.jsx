import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ImageCarousel from "../components/images/ImageCarousel";
import WhatsAppIcon from "../components/WhatsAppIcon";
import PublicServiceFilters from "../components/filters/PublicServiceFilters";

import carService from "../services/carService";
import apartmentService from "../services/apartmentService";
import yachtService from "../services/yachtService";
import villaService from "../services/villaService";

import { BathtubOutlined, BedOutlined, People } from "@mui/icons-material";

const MotionGrid = motion.create(Grid);
const MotionCard = motion.create(Card);

function ServiceList() {
  const { t } = useTranslation();
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLaptop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    const fetchServices = async () => {
      if (!type) {
        setError("Invalid service type");
        setLoading(false);
        return;
      }

      try {
        let data;
        switch (type) {
          case "cars":
            data = await carService.getAllCars(filters);
            break;
          case "apartments":
            data = await apartmentService.getAllApartments(filters);
            break;
          case "yachts":
            data = await yachtService.getAllYachts(filters);
            break;
          case "villas":
            data = await villaService.getAllVillas(filters);
            break;
          default:
            throw new Error(t("errors.invalidServiceType", { type }));
        }

        setServices(data);
      } catch (err) {
        console.error(t("errors.fetchingServices"), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [t, type, filters]);

  const renderServiceDetails = (service) => {
    switch (type) {
      case "cars":
        return (
          <>
            <Typography sx={{ mb: 2 }} variant="h5" fontWeight="bold">
              {`${service.brand} ${service.model}`}
            </Typography>
            <Chip 
              icon={<People />}
              label={`${service.passengers || 0} ${t("services.passengers")}`}
              size="small"
              color="primary"
              sx={{ mb: 2 }}
            />
            <Typography sx={{ mb: 1 }}>
              {t("services.description")}: {service.description}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold",
                variant: "h6",
                fontSize: "1.3rem",
              }}
            >
              $
              {service.price
                ? parseFloat(service.price).toFixed(2)
                : t("general.notAvailable")}
              /{t("units.day")}
            </Typography>
          </>
        );
      case "apartments":
      case "villas":
        return (
          <>
            <Typography variant="h5" fontWeight="bold">
              {service.name}
            </Typography>
            <Typography>
              {t("services.description")}: {service.description}
            </Typography>
            <Typography>
              {t("services.capacity")}: {service.capacity}
            </Typography>
            <Typography>
              {t("services.address")}: {service.address}
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <BedOutlined sx={{ mr: 1 }} /> {service.rooms}{" "}
              {t("services.rooms")}
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <BathtubOutlined sx={{ mr: 1 }} /> {service.bathrooms}{" "}
              {t("services.bathrooms")}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold",
                variant: "h6",
                fontSize: "1.3rem",
              }}
            >
              $
              {service.price
                ? parseFloat(service.price).toFixed(2)
                : t("general.notAvailable")}
              /{t("units.day")}
            </Typography>
          </>
        );
      case "yachts":
        return (
          <>
            <Typography variant="h5" fontWeight="bold">
              {service.name}
            </Typography>
            <Typography>
              {t("services.description")}: {service.description}{" "}
              {t("units.feet")}
            </Typography>
            <Typography>
              {t("services.capacity")}: {service.capacity} {t("units.people")}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold",
                variant: "h6",
                fontSize: "1.3rem",
              }}
            >
              $
              {service.price
                ? parseFloat(service.price).toFixed(2)
                : t("general.notAvailable")}
              /{type === "yachts" ? t("units.hour") : t("units.day")}
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        maxWidth="md"
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          py: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        maxWidth="md"
      >
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          {t("navigation.backToHome")}
        </Button>
      </Container>
    );
  }

  if (!services || services.length === 0) {
    // Si hay filtros activos, mostrar mensaje diferente y mantener filtros visibles
    const hasActiveFilters = Object.keys(filters).length > 0;
    
    return (
      <Container sx={{ py: 8, px: { xs: 2, md: 3 } }} maxWidth="xl" disableGutters>
        <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: 8, lg: 10 }}>
          {(type === 'cars' || type === 'apartments') && (
            <Grid item xs={12} md={2} lg={2} sx={{ pr: { md: 2 } }}>
              {/* Espaciador: título oculto para alinear con el inicio de las tarjetas */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{ mb: 4, visibility: 'hidden' }}
                >
                  {t(`services.types.${type}`)}
                </Typography>
              </Box>
              <PublicServiceFilters 
                type={type} 
                onFiltersChange={setFilters} 
              />
            </Grid>
          )}

          <Grid item xs={12} md={(type === 'cars' || type === 'apartments') ? 10 : 12} lg={(type === 'cars' || type === 'apartments') ? 10 : 12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="text.primary"
                fontWeight="400"
                gutterBottom
                sx={{ mb: 4 }}
              >
                {t(`services.types.${type}`)}
              </Typography>
            </Box>
            <Container
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              maxWidth="md"
            >
              {hasActiveFilters ? (
                <>
                  <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                    {t("services.noResultsWithFilters") || "No se encontraron resultados con estos filtros"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    {t("services.tryAdjustingFilters") || "Intenta ajustar los filtros para encontrar más opciones"}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setFilters({})}
                    sx={{ mr: 2 }}
                  >
                    {t("filters.clearFilters") || "Limpiar Filtros"}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h5" gutterBottom>
                    {t("services.noServicesFound")}
                  </Typography>
                  <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
                    {t("navigation.backToHome")}
                  </Button>
                </>
              )}
            </Container>
          </Grid>
        </Grid>
      </Container>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
      },
    },
  };

  return (
    <Container 
      sx={{ 
        py: 8, 
        px: { xs: 2, md: isLaptop ? 2 : 3, lg: 3 } 
      }} 
      maxWidth={isLaptop ? "xl" : "xl"} 
      disableGutters={false}
    >
      <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: isLaptop ? 3 : 8, lg: 10 }}>
        {/* Columna izquierda - Filtros */}
        {(type === 'cars' || type === 'apartments') && (
          <Grid item xs={12} md={isLaptop ? 3 : 2} lg={2} sx={{ pr: { md: 2 } }}>
            {/* Espaciador: título oculto para alinear con el inicio de las tarjetas */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                component="h1"
                variant="h2"
                sx={{ mb: 4, visibility: 'hidden' }}
              >
                {t(`services.types.${type}`)}
              </Typography>
            </Box>
            <PublicServiceFilters 
              type={type} 
              onFiltersChange={setFilters} 
            />
          </Grid>
        )}

        {/* Columna derecha - Título y servicios */}
        <Grid 
          item 
          xs={12} 
          md={(type === 'cars' || type === 'apartments') ? (isLaptop ? 9 : 10) : 12}
          lg={(type === 'cars' || type === 'apartments') ? 10 : 12}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              fontWeight="400"
              gutterBottom
              sx={{ mb: 4 }}
            >
              {t(`services.types.${type}`)}
            </Typography>
          </Box>

          <Grid
            container
            spacing={isLaptop ? 2 : 4}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignContent: "flex-start",
              maxWidth: isLaptop ? "900px" : "100%",
              mx: "auto",
            }}
          >
            {services.map((service) => (
              <MotionGrid
                item
                xs={12}
                sm={6}
                md={6}
                lg={4}
                key={service.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                component={Link}
                to={`/services/${type}/${service.id}`}
                sx={{ 
                  textDecoration: "none",
                  maxWidth: isLaptop ? "400px" : "100%",
                  minWidth: isLaptop ? "350px" : "auto",
                }}
              >
                <MotionCard
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageCarousel
                    images={
                      Array.isArray(service.images)
                        ? service.images
                        : [service.images]
                    }
                    height={
                      isMobile 
                        ? "250px" 
                        : isTablet 
                        ? "220px" 
                        : isLaptop 
                        ? "240px" 
                        : "250px"
                    }
                    width="100%"
                    aspectRatio="16/9"
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    mt: 2, 
                    ml: 2,
                    px: 2,
                    py: 2,
                  }}>
                    {renderServiceDetails(service)}
                  </CardContent>
                  <CardActions>
                    <Button
                      sx={{ ml: 2, mb: 2 }}
                      size="mediun"
                      component={Link}
                      variant="outlined"
                      to={`/services/${type}/${service.id}`}
                    >
                      {t("general.viewDetails")}
                    </Button>
                  </CardActions>
                </MotionCard>
              </MotionGrid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <WhatsAppIcon />
    </Container>
  );
}

export default ServiceList;
