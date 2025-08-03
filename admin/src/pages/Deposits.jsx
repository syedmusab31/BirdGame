import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, Clock, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    approved: {
      color: 'bg-green-100 text-green-800',
      icon: Check,
    },
    declined: {
      color: 'bg-red-100 text-red-800',
      icon: X,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ActionModal = ({ isOpen, onClose, deposit, onSave }) => {
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (deposit) {
      setStatus(deposit.status);
      setAdminNote(deposit.adminNote || '');
    }
  }, [deposit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/admin/deposits/${deposit._id}`, {
        status,
        adminNote,
      });

      if (response.data.success) {
        toast.success('Deposit status updated successfully');
        onSave();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update deposit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !deposit) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Update Deposit Status
          </h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">User:</span> {deposit.userId?.username || 'Unknown'}</p>
              <p><span className="font-medium">Amount:</span> ${deposit.amount}</p>
              <p><span className="font-medium">Gold Amount:</span> {deposit.goldAmount}</p>
              <p><span className="font-medium">Method:</span> {deposit.paymentMethod}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Note (Optional)
                </label>
                <textarea
                  id="adminNote"
                  name="adminNote"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note about this deposit..."
                />
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
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    let filtered = deposits;

    if (searchTerm) {
      filtered = filtered.filter(deposit =>
        deposit.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deposit => deposit.status === statusFilter);
    }

    setFilteredDeposits(filtered);
  }, [deposits, searchTerm, statusFilter]);

  const fetchDeposits = async () => {
    try {
      const response = await axios.get('/admin/deposits');
      if (response.data.success) {
        setDeposits(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch deposits');
      console.error('Deposits fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (deposit) => {
    setSelectedDeposit(deposit);
    setModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const totalAmount = deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user deposit requests and approve or decline them.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">{pendingDeposits}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">{deposits.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell hidden">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell hidden">
                  Date
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-sm text-gray-500">
                    <DollarSign className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    {searchTerm || statusFilter !== 'all' ? 'No matching deposits' : 'No deposits found'}
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {deposit.userId?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {deposit.userId?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">
                            {deposit.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(deposit.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {deposit.goldAmount} Gold
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:table-cell hidden">
                      <StatusBadge status={deposit.status} />
                    </td>
                    <td className="px-4 py-4 sm:table-cell hidden">
                      <div className="text-sm text-gray-500">
                        {formatDate(deposit.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleAction(deposit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        deposit={selectedDeposit}
        onSave={fetchDeposits}
      />
    </div>
  );
};

export default Deposits;