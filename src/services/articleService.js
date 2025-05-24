import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchArticles = async (params = {}) => {
  const response = await axios.get(`${API_URL}/articles`, { params });
  return response.data.articles;
};

export const fetchArticleById = async (id) => {
  const response = await axios.get(`${API_URL}/articles/${id}`);
  return response.data.article;
};