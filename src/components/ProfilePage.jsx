import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Shield,
  CreditCard,
  History
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import FileUploadComponent from './FileUploadComponent';

const ProfilePage = ({ user, onUpdateProfile }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm(data);
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
        onUpdateProfile?.(updatedProfile);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setEditing(false);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (imageUrl) => {
    handleInputChange('avatar_url', imageUrl);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 sm:mb-0">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <User className="h-16 w-16 text-gray-500" />
                  </div>
                )}
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                  <p className="text-gray-600">ID: {profile?.student_id}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : profile?.role === 'staff'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.email || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {editing ? (
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{profile?.wallet_balance?.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Member Since</p>
                <p className="text-gray-600">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <History className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Total Orders</p>
                <p className="text-gray-600">{profile?.total_orders || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {editing && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
          <FileUploadComponent
            onFileSelect={handleAvatarUpload}
            currentImageUrl={editForm.avatar_url}
            accept="image/*"
            maxSize={2 * 1024 * 1024} // 2MB
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;