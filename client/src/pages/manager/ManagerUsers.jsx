import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, UserPlus, Shield, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const ManagerUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'office_manager',
    preferredLanguage: 'en',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/users', formData);
      setMessage(`Privileged staff account for '${formData.name}' created successfully.`);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'office_manager',
        preferredLanguage: 'en',
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/users/${user._id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading cooperative user directory..." size="lg" />;

  const columns = [
    { header: 'Full Name', accessor: 'name', render: (row) => <span className="font-bold text-gray-900">{row.name}</span> },
    { header: 'Email Address', accessor: 'email' },
    { header: 'Phone Number', accessor: 'phone' },
    {
      header: 'Assigned Role',
      render: (row) => (
        <span className="capitalize font-semibold text-xs px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
          {row.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
            row.status === 'active'
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {row.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff & User Administration</h1>
          <p className="text-xs text-gray-500">
            Create privileged staff accounts and control portal access for cooperative personnel
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Provision Privileged Account</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Provision Privileged Staff Account</h3>
            <p className="text-xs text-gray-500 mb-4">
              Privileged roles cannot be created through public self-registration.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alazar Mengistu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@ofdms.et"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 91 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Privileged Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  >
                    <option value="office_manager">Office Manager</option>
                    <option value="agricultural_expert">Agricultural Expert</option>
                    <option value="laborer">Distribution Laborer</option>
                    <option value="manager">General Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-agri-700 rounded-xl hover:bg-agri-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search staff and farmers by name, email, or phone..."
        emptyTitle="No Users Found"
      />
    </div>
  );
};

export default ManagerUsers;
