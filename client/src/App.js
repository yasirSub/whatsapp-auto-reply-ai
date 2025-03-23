import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import MessageTemplates from './pages/MessageTemplates';
import AISettings from './pages/AISettings';
import ScheduledMessages from './pages/ScheduledMessages';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

// Create query client
const queryClient = new QueryClient();

// Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366', // WhatsApp green
      contrastText: '#fff',
    },
    secondary: {
      main: '#34B7F1', // WhatsApp blue
    },
    background: {
      default: '#f0f2f5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <AuthProvider>
            <SettingsProvider>
              <WhatsAppProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="contacts" element={<Contacts />} />
                      <Route path="contacts/:id" element={<ContactDetail />} />
                      <Route path="templates" element={<MessageTemplates />} />
                      <Route path="ai-settings" element={<AISettings />} />
                      <Route path="scheduled" element={<ScheduledMessages />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </Router>
              </WhatsAppProvider>
            </SettingsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;