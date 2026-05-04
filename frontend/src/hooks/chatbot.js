import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const getChatbotResponse = async (message) => {
    setLoading(true);
    try {
      // Include searchMode flag in the request to tell backend to use Tavily
      const response = await axios.post('/api/chatbot/chat', { 
        message,
        useSearch: searchMode, // Pass the current search mode state
        sessionId: localStorage.getItem('chatSessionId') || Date.now().toString(),
        userId: localStorage.getItem('userId'),
        userType: localStorage.getItem('userType') || 'guest'
      });
      
      // Store session ID for consistent chat history
      if (!localStorage.getItem('chatSessionId')) {
        localStorage.setItem('chatSessionId', Date.now().toString());
      }
      
      return { 
        response: response.data.response,
        intent: response.data.intent,
        isSearchResult: response.data.intent === 'search' || searchMode
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Failed to get chatbot response');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChatHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('chatSessionId');
      
      // Include sessionId in query params if available
      const params = {};
      if (sessionId) params.sessionId = sessionId;
      
      const response = await axios.get('/api/chatbot/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Chat history error:', error);
      toast.error('Failed to fetch chat history');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChatAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chatbot/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to fetch chat analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    const newMode = !searchMode;
    setSearchMode(newMode);
    return newMode;
  };

  return {
    loading,
    searchMode,
    getChatbotResponse,
    getChatHistory,
    getChatAnalytics,
    toggleSearchMode
  };
};
