import React, { useState, useEffect } from 'react';
import { QrCode, Eye, EyeOff, Camera, AlertCircle } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import LoadingSpinner from '../components/LoadingSpinner';
import loginBackground from '../Assets/bkg2.jpg';
import loginBackground2 from '../Assets/bkg3.jpg';

const LoginPage = ({ onLogin }) => {
  const [qrCode, setQrCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const backgrounds = [loginBackground, loginBackground2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (result) => {
    setQrCode(result);
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Images with Transition */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center transform transition-all duration-500 hover:scale-105">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-4 shadow-lg animate-[bounceIn_0.8s] backdrop-blur-sm border border-white/20">
            <QrCode className="h-12 w-12 text-white animate-[pulse_2s_infinite]" />
          </div>
          <h2 className="text-4xl font-extrabold text-white font-sans drop-shadow-md animate-[fadeInDown_0.6s]">
            Smart Canteen
          </h2>
          <p className="mt-3 text-lg text-white/90 animate-[fadeIn_0.8s]">
            Welcome back! Please sign in
          </p>
        </div>

        {/* Glass Login Form */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 space-y-6 border border-white/30 animate-[slideUp_0.5s] hover:shadow-xl transition-all duration-300">
          {error && (
            <div className="bg-red-400/20 border-l-4 border-red-400 rounded-md p-4 flex items-start space-x-3 animate-[shake_0.5s] backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-100 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-100">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* QR Code Input */}
            <div className="space-y-1 animate-[fadeIn_0.6s]">
              <label className="block text-sm font-medium text-white/90 mb-1">
                QR Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Scan or enter QR code"
                  className="flex-1 px-4 py-3 bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-3 bg-cyan-500/90 text-white rounded-lg hover:bg-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-1 animate-[fadeIn_0.8s]">
              <label className="block text-sm font-medium text-white/90 mb-1">
                PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 4-digit PIN"
                  maxLength="4"
                  className="w-full px-4 py-3 pr-10 bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-all duration-200"
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !qrCode || !pin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span className="flex items-center">
                  Sign In
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;