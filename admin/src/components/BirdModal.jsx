import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../api/axios'; // using your instance

const BirdModal = ({ onClose, fetchBirds, editingBird }) => {
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
    if (editingBird) {
      setFormData({
        name: editingBird.name || '',
        price: editingBird.price || '',
        eggsPerHour: editingBird.eggsPerHour || '',
        eggsPerMonth: editingBird.eggsPerMonth || '',
        isActive: editingBird.isActive ?? true,
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
  }, [editingBird]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBird ? `/admin/birds/${editingBird._id}` : '/admin/birds';
      const method = editingBird ? 'put' : 'post';

      const response = await api[method](url, formData);
      if (response.data.success) {
        toast.success(editingBird ? 'Bird updated successfully' : 'Bird created successfully');
        fetchBirds();
        onClose();
      } else {
        toast.error('Unexpected error');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {editingBird ? 'Edit Bird' : 'Add Bird'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'price', 'eggsPerHour', 'eggsPerMonth'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BirdModal;
