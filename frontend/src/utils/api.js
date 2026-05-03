import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getSymptoms = async () => {
  try {
    const response = await api.get('/symptoms');
    return response.data.symptoms;
  } catch (error) {
    console.error("Error fetching symptoms", error);
    throw error;
  }
};

export const predictDisease = async (symptoms) => {
  try {
    const response = await api.post('/predict', { symptoms });
    return response.data;
  } catch (error) {
    console.error("Error predicting disease", error);
    throw error;
  }
};

export const chatWithBot = async (message) => {
  try {
    const response = await api.post('/chat', { message });
    return response.data.reply;
  } catch (error) {
    console.error("Error chatting", error);
    return "Sorry, I am having trouble connecting to the server.";
  }
};
