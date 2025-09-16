import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon
} from '@mui/icons-material';

import salesVolumeService from '../../../services/salesVolumeService';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const SalesVolumeChart = () => {
  const theme = useTheme();
  const { isMobile } = useDeviceDetection();

  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Controles de filtros
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [groupBy, setGroupBy] = useState('month');

  // Rangos predefinidos
  const quickRanges = useMemo(() => salesVolumeService.getQuickDateRanges(), []);

  // Inicializar con el mes actual
  useEffect(() => {
    const currentMonth = quickRanges.currentMonth;
    setFromDate(currentMonth.from);
    setToDate(currentMonth.to);
    setGroupBy(currentMonth.groupBy);
  }, [quickRanges]);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    const fetchData = async () => {
      if (!fromDate || !toDate) return;

      setLoading(true);
      setError(null);

      try {
        const response = await salesVolumeService.getSalesVolume(fromDate, toDate, groupBy);
        setData(response);
      } catch (err) {
        setError('Error loading sales volume data. Please try again.');
        console.error('Sales volume error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (fromDate && toDate) {
      fetchData();
    }
  }, [fromDate, toDate, groupBy]);

  // Función para refrescar manualmente
  const refreshData = async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await salesVolumeService.getSalesVolume(fromDate, toDate, groupBy);
      setData(response);
    } catch (err) {
      setError('Error loading sales volume data. Please try again.');
      console.error('Sales volume error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar rango rápido
  const applyQuickRange = (rangeKey) => {
    const range = quickRanges[rangeKey];
    setFromDate(range.from);
    setToDate(range.to);
    setGroupBy(range.groupBy);
  };

  // Datos procesados para el gráfico
  const chartData = useMemo(() => {
    if (!data?.series) return [];

    return data.series.map(item => ({
      ...item,
      period: salesVolumeService.formatPeriod(item.period, groupBy),
      totalRevenue: Number(item.totalRevenue) || 0,
      totalPayments: Number(item.totalPayments) || 0
    }));
  }, [data, groupBy]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    if (!data?.series) return null;
    return salesVolumeService.calculateStats(data.series);
  }, [data]);

  // Formateador de moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                {entry.dataKey === 'totalRevenue' ? 'Revenue: ' : 'Payments: '}
                {entry.dataKey === 'totalRevenue' 
                  ? formatCurrency(entry.value)
                  : entry.value
                }
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Controles de Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Sales Volume Report
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* Rangos Rápidos */}
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick Ranges:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(quickRanges).map(([key, range]) => (
                <Chip
                  key={key}
                  label={range.label}
                  size="small"
                  onClick={() => applyQuickRange(key)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Controles Personalizados */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                label="Group By"
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={refreshData}
              disabled={!fromDate || !toDate || loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CalendarIcon />}
              fullWidth
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Métricas de Resumen */}
      {data && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {formatCurrency(data.totals?.totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                {stats && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg: {formatCurrency(stats.averageRevenue)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {data.totals?.totalPayments || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Payments
                </Typography>
                {stats && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg: {Math.round(stats.averagePayments)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {stats && stats.growthRate >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                )}
                <Typography 
                  variant="h5" 
                  color={stats && stats.growthRate >= 0 ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {stats ? `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%` : '0%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Growth Rate
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  First vs Last Half
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" color="warning.main" fontWeight="bold" noWrap>
                  {stats?.bestPeriod ? 
                    salesVolumeService.formatPeriod(stats.bestPeriod.period, groupBy) :
                    'N/A'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best Period
                </Typography>
                {stats?.bestPeriod && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatCurrency(stats.bestPeriod.totalRevenue)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Gráfico */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          Sales Volume Trends
        </Typography>

        {loading ? (
          <Box sx={{ height: 400 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Box>
        ) : chartData.length > 0 ? (
          <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="period" 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  stroke={theme.palette.success.main}
                  tickFormatter={formatCurrency}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="payments"
                  orientation="right"
                  stroke={theme.palette.primary.main}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Bar
                  yAxisId="revenue"
                  dataKey="totalRevenue"
                  name="Revenue"
                  fill={theme.palette.success.main}
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="payments"
                  dataKey="totalPayments"
                  name="Payments"
                  fill={theme.palette.primary.main}
                  opacity={0.6}
                  radius={[4, 4, 0, 0]}
                />

                {stats && (
                  <ReferenceLine
                    yAxisId="revenue"
                    y={stats.averageRevenue}
                    stroke={theme.palette.success.dark}
                    strokeDasharray="8 8"
                    label="Avg Revenue"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No sales data available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting the date range or check if there are any payments in this period
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SalesVolumeChart;
