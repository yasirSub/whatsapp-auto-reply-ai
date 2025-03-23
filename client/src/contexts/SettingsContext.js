import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [aiModels, setAiModels] = useState([]);
  const [activeAiModel, setActiveAiModel] = useState(null);
  const [messageModes, setMessageModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchAiModels();
    fetchMessageModes();
    fetchSystemStatus();
  }, []);

  // Fetch application settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      enqueueSnackbar('Failed to fetch settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update application settings
  const updateSettings = async (updatedSettings) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/settings', updatedSettings);
      setSettings(response.data.data);
      enqueueSnackbar('Settings updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating settings:', error);
      enqueueSnackbar('Failed to update settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/settings/reset');
      setSettings(response.data.data);
      enqueueSnackbar('Settings reset to defaults', { variant: 'success' });
    } catch (error) {
      console.error('Error resetting settings:', error);
      enqueueSnackbar('Failed to reset settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available AI models
  const fetchAiModels = async () => {
    try {
      const response = await axios.get('/api/ai-models');
      setAiModels(response.data.data);
      
      // Fetch active model
      const activeResponse = await axios.get('/api/ai-models/active');
      setActiveAiModel(activeResponse.data.data.activeModel);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      enqueueSnackbar('Failed to fetch AI models', { variant: 'error' });
    }
  };

  // Set active AI model
  const setActiveModel = async (provider, modelId) => {
    try {
      const response = await axios.put('/api/ai-models/active', { provider, modelId });
      setActiveAiModel(response.data.data.model);
      enqueueSnackbar('AI model updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error setting active AI model:', error);
      enqueueSnackbar('Failed to update AI model', { variant: 'error' });
    }
  };

  // Update local AI settings
  const updateLocalAiSettings = async (localAiEnabled, localAiModelPath) => {
    try {
      const response = await axios.put('/api/ai-models/local-settings', {
        localAIEnabled: localAiEnabled,
        localAIModelPath: localAiModelPath
      });
      
      // Update settings with new values
      setSettings(prevSettings => ({
        ...prevSettings,
        localAIEnabled: response.data.data.localAIEnabled,
        localAIModelPath: response.data.data.localAIModelPath
      }));
      
      enqueueSnackbar('Local AI settings updated', { variant: 'success' });
    } catch (error) {
      console.error('Error updating local AI settings:', error);
      enqueueSnackbar('Failed to update local AI settings', { variant: 'error' });
    }
  };

  // Fetch available message modes
  const fetchMessageModes = async () => {
    try {
      const response = await axios.get('/api/settings/message-modes');
      setMessageModes(response.data.data);
    } catch (error) {
      console.error('Error fetching message modes:', error);
    }
  };

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('/api/settings/system-status');
      setSystemStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const value = {
    settings,
    loading,
    aiModels,
    activeAiModel,
    messageModes,
    systemStatus,
    fetchSettings,
    updateSettings,
    resetSettings,
    fetchAiModels,
    setActiveModel,
    updateLocalAiSettings,
    fetchMessageModes,
    fetchSystemStatus
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;