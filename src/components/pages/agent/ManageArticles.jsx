import React, { useEffect, useState } from 'react';
import { FaPen, FaPlus, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AgentLayout from '../../layout/AgentLayout';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Care Guide',
    description: '',
    content: '',
    tags: '',
    isPublished: true,
  });
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem('authToken');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(res.data.articles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()),
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/articles/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/articles`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({
        title: '',
        category: 'Care Guide',
        description: '',
        content: '',
        tags: '',
        isPublished: true,
      });
      setEditId(null);
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await axios.delete(`${API_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      category: article.category,
      description: article.description,
      content: article.content,
      tags: article.tags.join(', '),
      isPublished: article.isPublished,
    });
    setEditId(article._id || article.id);
  };

  return (
    <AgentLayout>
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Knowledge Base Articles</h1>
          <button onClick={fetchArticles} className="text-sm flex items-center bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
            <FaSync className="mr-1" /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Article' : 'Create New Article'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="border px-3 py-2 rounded" />
            <select name="category" value={formData.category} onChange={handleChange} className="border px-3 py-2 rounded">
              <option>Care Guide</option>
              <option>Policies</option>
              <option>Orders</option>
              <option>FAQs</option>
              <option>General</option>
            </select>
            <input name="description" value={formData.description} onChange={handleChange} placeholder="Short description" required className="col-span-2 border px-3 py-2 rounded" />
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Write your article here in plain English. Line breaks will be preserved." rows="6" required className="col-span-2 border px-3 py-2 rounded" />
            <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Comma-separated tags" className="col-span-2 border px-3 py-2 rounded" />
            <label className="col-span-2 flex items-center gap-2">
              <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
              <span>Published</span>
            </label>
            <button type="submit" className="col-span-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
              {editId ? 'Update Article' : 'Create Article'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Articles</h2>
          {loading ? (
            <p>Loading articles...</p>
          ) : articles.length === 0 ? (
            <p className="text-gray-600">No articles available.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map(article => (
                <div key={article._id} className="border p-4 rounded hover:shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">{article.category}</span>
                    <div className="flex gap-3">
                    <button onClick={() => handleEdit(article)} className="text-sm text-blue-500 hover:underline flex items-center">
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(article._id)} className="text-sm text-red-500 hover:underline">
                      Delete
                    </button>
                  </div>
                  </div>
                  <h3 className="font-semibold text-gray-800">{article.title}</h3>
                  <p className="text-sm text-gray-600">{article.description}</p>
                  <p className="text-xs mt-1 text-gray-400">{article.tags.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AgentLayout>
  );
};

export default ManageArticles;
