import React, { useState, useEffect } from 'react';
import { Plus, Edit, Bird as BirdIcon, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const BirdModal = ({ isOpen, onClose, bird = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    eggsPerHour: '',
    eggsPerMonth: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (bird) {
      setFormData({
        name: bird.name || '',
        price: bird.price || '',
        eggsPerHour: bird.eggsPerHour || '',
        eggsPerMonth: bird.eggsPerMonth || '',
        isActive: bird.isActive !== undefined ? bird.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        eggsPerHour: '',
        eggsPerMonth: '',
        isActive: true,
      });
    }
  }, [bird]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = bird ? `/admin/birds/${bird._id}` : '/admin/birds';
      const method = bird ? 'put' : 'post';
      
      const response = await axios[method](url, formData);
      
      if (response.data.success) {
        toast.success(bird ? 'Bird updated successfully' : 'Bird created successfully');
        onSave();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {bird ? 'Edit Bird' : 'Create New Bird'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Bird Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="eggsPerHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Eggs Per Hour
                </label>
                <input
                  type="number"
                  id="eggsPerHour"
                  name="eggsPerHour"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.eggsPerHour}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="eggsPerMonth" className="block text-sm font-medium text-gray-700 mb-1">
                  Eggs Per Month
                </label>
                <input
                  type="number"
                  id="eggsPerMonth"
                  name="eggsPerMonth"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.eggsPerMonth}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (bird ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Birds = () => {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBird, setSelectedBird] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchBirds();
  }, []);

  const fetchBirds = async () => {
    try {
      const response = await axios.get('/admin/birds');
      if (response.data.success) {
        setBirds(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch birds');
      console.error('Birds fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bird) => {
    setSelectedBird(bird);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBird(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBird(null);
  };

  const handleSave = () => {
    fetchBirds();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Birds Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage bird types, their prices, and egg production rates.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bird
        </button>
      </div>

      {/* Birds Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {birds.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <BirdIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No birds</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new bird type.</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bird
            </button>
          </div>
        ) : (
          birds.map((bird) => (
            <div key={bird._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BirdIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">{bird.name}</h3>
                      <div className="mt-1">
                        {bird.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(bird)}
                    className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Price</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatCurrency(bird.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Eggs/Hour</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {bird.eggsPerHour}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs sm:text-sm text-gray-500">Eggs/Month</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {bird.eggsPerMonth}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">ROI Calculation</p>
                  <div className="mt-1 text-sm">
                    <p>Monthly Revenue: <span className="font-semibold">{bird.eggsPerMonth} eggs</span></p>
                    <p>Break-even: <span className="font-semibold">
                      {Math.ceil(bird.price / (bird.eggsPerMonth * 0.1))} months
                    </span></p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {birds.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Summary</h3>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Total Birds</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{birds.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Birds</p>
                <p className="text-xl sm:text-2xl font-semibold text-green-600">
                  {birds.filter(bird => bird.isActive).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Price</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {formatCurrency(birds.reduce((sum, bird) => sum + bird.price, 0) / birds.length)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Eggs</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {birds.reduce((sum, bird) => sum + bird.eggsPerMonth, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <BirdModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        bird={selectedBird}
        onSave={handleSave}
      />
    </div>
  );
};

export default Birds;