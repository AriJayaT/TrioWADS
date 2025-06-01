import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaBook, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { articleService } from '../../../services/api';
import AgentNavbar from '../../common/AgentNavbar';

const ArticleManagement = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentArticle, setCurrentArticle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Care Guide', 'Policies', 'Orders', 'FAQs', 'General'];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: '',
    content: '',
    isPublished: true
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticles({
        published: false, // Get all articles including drafts
        limit: 100
      });
      
      if (response.success) {
        // Filter to show only articles created by this agent or all if needed
        setArticles(response.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (mode, article = null) => {
    setModalMode(mode);
    setCurrentArticle(article);
    
    if (mode === 'create') {
      setFormData({
        title: '',
        category: 'General',
        description: '',
        content: '',
        isPublished: true
      });
    } else if (mode === 'edit' && article) {
      setFormData({
        title: article.title,
        category: article.category,
        description: article.description,
        content: article.content,
        isPublished: article.isPublished
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentArticle(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const articleData = {
        ...formData
      };

      let response;
      if (modalMode === 'create') {
        response = await articleService.createArticle(articleData);
        setSuccess('Article created successfully!');
      } else if (modalMode === 'edit') {
        response = await articleService.updateArticle(currentArticle._id, articleData);
        setSuccess('Article updated successfully!');
      }

      if (response.success) {
        await fetchArticles();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setError(typeof error === 'string' ? error : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      await articleService.deleteArticle(articleId);
      setSuccess('Article deleted successfully!');
      await fetchArticles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting article:', error);
      setError(typeof error === 'string' ? error : 'Failed to delete article');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <AgentNavbar activeItem="Articles" />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-pink-500 text-2xl" />
          <span className="ml-2">Loading articles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <AgentNavbar activeItem="Articles" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Article Management</h1>
            <p className="text-gray-600">Create and manage knowledge base articles</p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Article
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Articles</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Articles ({filteredArticles.length})
            </h2>
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first article.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openModal('create')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                >
                  <FaPlus className="mr-2 inline" />
                  Create Article
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <div key={article._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          article.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {article.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{article.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        <span>By {article.author?.name || 'Unknown'}</span>
                        <span>Views: {article.viewCount || 0}</span>
                        <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal('view', article)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Article"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openModal('edit', article)}
                        className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Edit Article"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Article"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && 'Create New Article'}
                {modalMode === 'edit' && 'Edit Article'}
                {modalMode === 'view' && 'View Article'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {modalMode === 'view' ? (
              /* View Mode */
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{currentArticle?.title}</h3>
                    <p className="text-gray-600">{currentArticle?.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {currentArticle?.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      currentArticle?.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentArticle?.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Content:</h4>
                    <div className="prose max-w-none">
                      {currentArticle?.content?.includes('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{currentArticle?.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Create/Edit Form */
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter article title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Brief description of the article"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Article content (HTML supported)"
                  />
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                  </label>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {modalMode === 'create' ? 'Create Article' : 'Update Article'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManagement; 