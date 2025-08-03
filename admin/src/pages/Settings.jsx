import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, DollarSign, Coins } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
  const [rates, setRates] = useState({
    usdToGoldRate: '',
    eggsToGoldRate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await axios.get('/admin/rates');
      if (response.data.success) {
        setRates({
          usdToGoldRate: response.data.data.usdToGoldRate || '',
          eggsToGoldRate: response.data.data.eggsToGoldRate || '',
        });
      }
    } catch (error) {
      toast.error('Failed to fetch conversion rates');
      console.error('Rates fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put('/admin/rates', {
        usdToGoldRate: parseFloat(rates.usdToGoldRate),
        eggsToGoldRate: parseFloat(rates.eggsToGoldRate),
      });

      if (response.data.success) {
        toast.success('Conversion rates updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update rates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage system settings and conversion rates
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={fetchRates}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Conversion Rates</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set the conversion rates for USD to Gold and Eggs to Gold
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="usdToGoldRate" className="block text-sm font-medium text-gray-700">
                  USD to Gold Rate
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="usdToGoldRate"
                    name="usdToGoldRate"
                    required
                    min="0"
                    step="0.01"
                    className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1.00"
                    value={rates.usdToGoldRate}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  How much gold 1 USD equals (e.g., 1 USD = {rates.usdToGoldRate || '1'} Gold)
                </p>
              </div>

              <div>
                <label htmlFor="eggsToGoldRate" className="block text-sm font-medium text-gray-700">
                  Eggs to Gold Rate
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Coins className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="eggsToGoldRate"
                    name="eggsToGoldRate"
                    required
                    min="0"
                    step="0.01"
                    className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.10"
                    value={rates.eggsToGoldRate}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  How much gold 1 egg equals (e.g., 1 Egg = {rates.eggsToGoldRate || '0.1'} Gold)
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Rate Preview */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Rate Preview</h3>
            <p className="mt-1 text-sm text-gray-500">
              Preview of current conversion rates
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900">USD to Gold</h4>
                    <p className="text-lg font-semibold text-blue-900">
                      $1 = {rates.usdToGoldRate || '0'} Gold
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Coins className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-900">Eggs to Gold</h4>
                    <p className="text-lg font-semibold text-green-900">
                      1 Egg = {rates.eggsToGoldRate || '0'} Gold
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example calculations */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Example Calculations</h4>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>$100 deposit:</span>
                  <span className="font-medium">
                    {(100 * (parseFloat(rates.usdToGoldRate) || 0)).toFixed(2)} Gold
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>1000 eggs:</span>
                  <span className="font-medium">
                    {(1000 * (parseFloat(rates.eggsToGoldRate) || 0)).toFixed(2)} Gold
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>100 Gold to USD:</span>
                  <span className="font-medium">
                    ${(100 / (parseFloat(rates.usdToGoldRate) || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;