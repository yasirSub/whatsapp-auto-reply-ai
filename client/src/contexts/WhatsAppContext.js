import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';

const WhatsAppContext = createContext();

export const useWhatsApp = () => useContext(WhatsAppContext);

export const WhatsAppProvider = ({ children }) => {
  const [status, setStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || '');
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });
    
    newSocket.on('whatsapp:qr', (qr) => {
      setQrCode(qr);
      setStatus('WAITING_FOR_QR_SCAN');
    });
    
    newSocket.on('whatsapp:ready', () => {
      setStatus('CONNECTED');
      setQrCode(null);
      enqueueSnackbar('WhatsApp connected successfully!', { variant: 'success' });
      fetchContacts();
    });
    
    newSocket.on('whatsapp:disconnected', () => {
      setStatus('DISCONNECTED');
      enqueueSnackbar('WhatsApp disconnected', { variant: 'warning' });
    });
    
    newSocket.on('whatsapp:error', (error) => {
      enqueueSnackbar(`WhatsApp error: ${error}`, { variant: 'error' });
    });
    
    setSocket(newSocket);
    
    // Check initial status
    fetchStatus();
    
    return () => {
      newSocket.disconnect();
    };
  }, [enqueueSnackbar]);

  // Fetch WhatsApp status
  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/whatsapp/status');
      setStatus(response.data.data.state);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    }
  };

  // Fetch WhatsApp contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/whatsapp/contacts');
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      enqueueSnackbar('Failed to fetch contacts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Sync WhatsApp contacts
  const syncContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/whatsapp/sync-contacts');
      enqueueSnackbar(`Synced ${response.data.data.length} contacts`, { variant: 'success' });
      await fetchContacts();
    } catch (error) {
      console.error('Error syncing contacts:', error);
      enqueueSnackbar('Failed to sync contacts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (contactId, message) => {
    try {
      await axios.post('/api/whatsapp/send-message', { contactId, message });
      enqueueSnackbar('Message sent successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar('Failed to send message', { variant: 'error' });
      return false;
    }
  };

  // Toggle contact auto-reply
  const toggleContactAutoReply = async (contactId) => {
    try {
      const response = await axios.post(`/api/contacts/${contactId}/toggle`);
      
      // Update contacts list
      setContacts(contacts.map(contact => 
        contact.whatsappId === contactId ? response.data.data : contact
      ));
      
      enqueueSnackbar(`Auto-reply ${response.data.data.isEnabled ? 'enabled' : 'disabled'} for contact`, { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error toggling contact auto-reply:', error);
      enqueueSnackbar('Failed to update contact settings', { variant: 'error' });
      return null;
    }
  };

  // Update contact settings
  const updateContact = async (contactId, data) => {
    try {
      const response = await axios.put(`/api/contacts/${contactId}`, data);
      
      // Update contacts list
      setContacts(contacts.map(contact => 
        contact.whatsappId === contactId ? response.data.data : contact
      ));
      
      enqueueSnackbar('Contact updated successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      enqueueSnackbar('Failed to update contact', { variant: 'error' });
      return null;
    }
  };

  // Fetch chat history for a contact
  const fetchChatHistory = async (contactId, limit = 50, offset = 0) => {
    try {
      const response = await axios.get(`/api/contacts/${contactId}/chat-history`, {
        params: { limit, offset }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      enqueueSnackbar('Failed to fetch chat history', { variant: 'error' });
      return { messages: [], total: 0 };
    }
  };

  // Logout from WhatsApp
  const logout = async () => {
    try {
      await axios.post('/api/whatsapp/logout');
      setStatus('DISCONNECTED');
      setQrCode(null);
      enqueueSnackbar('Logged out from WhatsApp', { variant: 'success' });
    } catch (error) {
      console.error('Error logging out:', error);
      enqueueSnackbar('Failed to logout', { variant: 'error' });
    }
  };

  const value = {
    status,
    qrCode,
    contacts,
    loading,
    fetchStatus,
    fetchContacts,
    syncContacts,
    sendMessage,
    toggleContactAutoReply,
    updateContact,
    fetchChatHistory,
    logout
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export default WhatsAppContext;