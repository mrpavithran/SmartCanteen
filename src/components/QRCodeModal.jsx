import React, { useState, useEffect } from 'react';
import { X, Download, QrCode } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const QRCodeModal = ({ user, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchQRCode();
    }
  }, [user]);

  const fetchQRCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/qr/view/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch QR code');
      }

      setQrData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/qr/download/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${user.student_id}_${user.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download QR code');
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">QR Code</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-gray-500 mt-2">Generating QR code...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <img
                src={qrData.qrCode}
                alt="QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="mb-4 text-sm text-gray-600">
              <p><strong>Name:</strong> {qrData.userData.name}</p>
              <p><strong>Student ID:</strong> {qrData.userData.studentId}</p>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <p><strong>QR Contains:</strong></p>
                <p>Student ID and encrypted credentials</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;