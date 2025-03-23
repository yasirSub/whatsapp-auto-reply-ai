import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useSettings } from './SettingsContext';

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { activeAiModel } = useSettings();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    fetchMemories();
  }, []);

  // Fetch message templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ai/templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      enqueueSnackbar('Failed to fetch templates', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Create a new template
  const createTemplate = async (template) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/templates', template);
      setTemplates(prev => [...prev, response.data.data]);
      enqueueSnackbar('Template created successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error creating template:', error);
      enqueueSnackbar('Failed to create template', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing template
  const updateTemplate = async (id, template) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/ai/templates/${id}`, template);
      setTemplates(prev => 
        prev.map(item => item.id === id ? response.data.data : item)
      );
      enqueueSnackbar('Template updated successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error updating template:', error);
      enqueueSnackbar('Failed to update template', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/ai/templates/${id}`);
      setTemplates(prev => prev.filter(item => item.id !== id));
      enqueueSnackbar('Template deleted successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      enqueueSnackbar('Failed to delete template', { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI memories
  const fetchMemories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ai/memories');
      setMemories(response.data.data);
    } catch (error) {
      console.error('Error fetching memories:', error);
      enqueueSnackbar('Failed to fetch AI memories', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Create/Add a new memory
  const createMemory = async (memory) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/memories', memory);
      setMemories(prev => [...prev, response.data.data]);
      enqueueSnackbar('Memory created successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error creating memory:', error);
      enqueueSnackbar('Failed to create memory', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing memory
  const updateMemory = async (id, memory) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/ai/memories/${id}`, memory);
      setMemories(prev => 
        prev.map(item => item.id === id ? response.data.data : item)
      );
      enqueueSnackbar('Memory updated successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error updating memory:', error);
      enqueueSnackbar('Failed to update memory', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a memory
  const deleteMemory = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/ai/memories/${id}`);
      setMemories(prev => prev.filter(item => item.id !== id));
      enqueueSnackbar('Memory deleted successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      enqueueSnackbar('Failed to delete memory', { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate response using AI
  const generateResponse = async (prompt, contactId, messageHistory = []) => {
    setGenerating(true);
    try {
      const response = await axios.post('/api/ai/generate', {
        prompt,
        contactId,
        messageHistory,
        modelId: activeAiModel?.id
      });
      
      setGenerating(false);
      return response.data.data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      enqueueSnackbar('Failed to generate AI response', { variant: 'error' });
      setGenerating(false);
      return null;
    }
  };

  // Train AI with custom data
  const trainAI = async (trainingData, contactId) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/train', {
        trainingData,
        contactId
      });
      
      enqueueSnackbar('AI training completed successfully', { variant: 'success' });
      return response.data.data;
    } catch (error) {
      console.error('Error training AI:', error);
      enqueueSnackbar('Failed to train AI', { variant: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    templates,
    memories,
    loading,
    generating,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    generateResponse,
    trainAI
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export default AIContext;