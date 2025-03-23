import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AIProvider } from './contexts/AIContext';

// Layout Component
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import WhatsAppSetup from './pages/WhatsApp/WhatsAppSetup';
import Contacts from './pages/WhatsApp/Contacts';
import ContactDetail from './pages/WhatsApp/ContactDetail';
import AITemplates from './pages/AI/AITemplates';
import AIMemories from './pages/AI/AIMemories';
import Settings from './pages/Settings/Settings';
import AISettings from './pages/Settings/AISettings';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25d366', // WhatsApp green
    },
    secondary: {
      main: '#128c7e', // Darker WhatsApp green
    },
    background: {
      default: '#f0f2f5', // WhatsApp light gray background
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If auth is still loading, return nothing
  if (loading) {
    return null; // Or a loading spinner
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Otherwise, render the children
  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/whatsapp/setup" 
          element={
            <ProtectedRoute>
              <Layout>
                <WhatsAppSetup />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/whatsapp/contacts" 
          element={
            <ProtectedRoute>
              <Layout>
                <Contacts />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/whatsapp/contacts/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <ContactDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai/templates" 
          element={
            <ProtectedRoute>
              <Layout>
                <AITemplates />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai/memories" 
          element={
            <ProtectedRoute>
              <Layout>
                <AIMemories />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/ai" 
          element={
            <ProtectedRoute>
              <Layout>
                <AISettings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <AuthProvider>
          <SettingsProvider>
            <WhatsAppProvider>
              <AIProvider>
                <AppContent />
              </AIProvider>
            </WhatsAppProvider>
          </SettingsProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;