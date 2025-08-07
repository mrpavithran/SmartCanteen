import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, Eye, EyeOff, User, Lock } from 'lucide-react';
import jsQR from 'jsqr';

const EnhancedQRScanner = ({ onScan, onClose, onManualLogin }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualCredentials, setManualCredentials] = useState({
    studentId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (!showManualLogin) {
      startCamera();
    }

    return () => {
      stopCamera();
      clearInterval(scanIntervalRef.current);
    };
  }, [showManualLogin]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        startAutoScan();
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const startAutoScan = () => {
    scanIntervalRef.current = setInterval(() => {
      captureAndScan();
    }, 1000);
  };

  const captureAndScan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code && code.data) {
      stopCamera();
      clearInterval(scanIntervalRef.current);
      
      // Parse QR code data to extract student ID
      const qrData = code.data;
      let studentId = '';
      
      // Handle different QR code formats
      if (qrData.includes('DEMO_')) {
        studentId = qrData;
      } else if (qrData.includes('CANTEEN_')) {
        const parts = qrData.split('_');
        studentId = parts[1] || qrData;
      } else {
        studentId = qrData;
      }
      
      // Show manual login with pre-filled student ID
      setManualCredentials(prev => ({ ...prev, studentId }));
      setShowManualLogin(true);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: manualCredentials.studentId,
          password: manualCredentials.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onManualLogin(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (showManualLogin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Enter Credentials</h3>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={manualCredentials.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Student ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={manualCredentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowManualLogin(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back to Scan
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={startCamera}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => setShowManualLogin(true)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Enter Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded"
              />
              <canvas ref={canvasRef} className="hidden" />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse"></div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 text-center">
              Position the QR code inside the frame. Scanning happens automatically.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={captureAndScan}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span>Scan Now</span>
              </button>
              <button
                onClick={() => setShowManualLogin(true)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Manual Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQRScanner;