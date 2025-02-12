import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box,
} from '@mui/material';

import AdminSidebar from './AdminSidebar';  // Import AdminSidebar

// Register all necessary elements with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f5c914' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#aaaaaa' },
  },
});

const AdminHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');  // active section for the sidebar

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics');
      setAnalytics(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch analytics');
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );

  if (error)
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Container>
      </ThemeProvider>
    );

  const { totalOrders, totalRevenue, revenueHistory, orderTrends, ordersByStatus } = analytics || {};

  const revenueChartData = revenueHistory?.length
    ? {
        labels: revenueHistory.map((entry) => entry.date),
        datasets: [
          {
            label: 'Revenue',
            data: revenueHistory.map((entry) => entry.totalRevenue),
            borderColor: '#f5c914',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(245, 201, 20, 0.2)',
          },
        ],
      }
    : {};

  const orderTrendsChartData = orderTrends?.length
    ? {
        labels: orderTrends.map((entry) => entry.date),
        datasets: [
          {
            label: 'Orders',
            data: orderTrends.map((entry) => entry.totalOrders),
            borderColor: '#34a853',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(52, 168, 83, 0.2)',
          },
        ],
      }
    : {};

  const ordersByStatusData = ordersByStatus
    ? {
        labels: Object.keys(ordersByStatus),
        datasets: [
          {
            label: 'Orders',
            data: Object.values(ordersByStatus),
            backgroundColor: ['#f5c914', '#34a853', '#ea4335', '#4285f4'],
          },
        ],
      }
    : {};

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar Component */}
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Content */}
        <Container sx={{ marginLeft: '260px', flexGrow: 1, marginBottom: '100px', marginTop: '30px' }}>
          {/* <Typography variant="h2" color="primary" gutterBottom>
            Analytics
          </Typography> */}

          {/* Cards for Summary */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Orders</Typography>
                  <Typography variant="h4">{totalOrders || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Revenue</Typography>
                  <Typography variant="h4">₹{totalRevenue ? totalRevenue.toFixed(2) : '0.00'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Revenue Over Time</Typography>
                  {revenueHistory?.length > 0 ? (
                    <Line data={revenueChartData} options={{ responsive: true }} height={150} />
                  ) : (
                    <Typography color="textSecondary">No revenue data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Orders Over Time</Typography>
                  {orderTrends?.length > 0 ? (
                    <Line data={orderTrendsChartData} options={{ responsive: true }} height={150} />
                  ) : (
                    <Typography color="textSecondary">No orders data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Orders by Status</Typography>
                  <Bar data={ordersByStatusData} options={{ responsive: true }} height={150} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Order Distribution</Typography>
                  <Doughnut data={ordersByStatusData} options={{ responsive: true }} height={150} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminHome;
