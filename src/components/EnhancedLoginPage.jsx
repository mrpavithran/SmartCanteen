import React, { useState, useEffect } from 'react';
import { QrCode, Eye, EyeOff, Camera, AlertCircle, User, Lock } from 'lucide-react';
import EnhancedQRScanner from '../components/EnhancedQRScanner';
import LoadingSpinner from '../components/LoadingSpinner';
import loginBackground from '../Assets/bkg2.jpg';
import loginBackground2 from '../Assets/bkg3.jpg';

const EnhancedLoginPage = ({ onLogin }) => {
  const [loginMethod, setLoginMethod] = useState('qr'); // 'qr' or 'manual'
  const [credentials, setCredentials] = useState({
    studentId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Route user based on role
      onLogin(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRLogin = (loginData) => {
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    onLogin(loginData.user);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
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
            Enhanced Authentication System
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2 border border-white/30">
          <div className="flex space-x-1">
            <button
              onClick={() => setLoginMethod('qr')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'qr'
                  ? 'bg-white/30 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              QR Code Login
            </button>
            <button
              onClick={() => setLoginMethod('manual')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'manual'
                  ? 'bg-white/30 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Manual Login
            </button>
          </div>
        </div>

        {/* Glass Login Form */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 space-y-6 border border-white/30 animate-[slideUp_0.5s] hover:shadow-xl transition-all duration-300">
          {error && (
            <div className="bg-red-400/20 border-l-4 border-red-400 rounded-md p-4 flex items-start space-x-3 animate-[shake_0.5s] backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-100 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-100">{error}</span>
            </div>
          )}

          {loginMethod === 'qr' ? (
            /* QR Code Login */
            <div className="space-y-4">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-white/80 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">QR Code Authentication</h3>
                <p className="text-white/70 text-sm mb-6">
                  Scan your QR code or enter credentials manually
                </p>
              </div>

              <button
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                <Camera className="h-5 w-5" />
                <span>Scan QR Code</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/70">or</span>
                </div>
              </div>

              <button
                onClick={() => setLoginMethod('manual')}
                className="w-full py-3 px-4 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Enter Credentials Manually
              </button>
            </div>
          ) : (
            /* Manual Login Form */
            <form onSubmit={handleManualLogin} className="space-y-5">
              <div className="space-y-1 animate-[fadeIn_0.6s]">
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Student ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    type="text"
                    value={credentials.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Enter your Student ID"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 animate-[fadeIn_0.8s]">
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-all duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !credentials.studentId || !credentials.password}
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

              <button
                type="button"
                onClick={() => setLoginMethod('qr')}
                className="w-full py-2 px-4 text-white/70 hover:text-white text-sm transition-all duration-200"
              >
                ← Back to QR Code Login
              </button>
            </form>
          )}
        </div>

        {/* Enhanced QR Scanner Modal */}
        {showScanner && (
          <EnhancedQRScanner
            onScan={() => {}} // Handled internally by the scanner
            onClose={() => setShowScanner(false)}
            onManualLogin={handleQRLogin}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedLoginPage;