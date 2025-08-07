import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';

const FileUploadComponent = ({ onFileSelect, currentImageUrl, accept = "image/*", maxSize = 5 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    return null;
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file to server
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Call parent callback with uploaded file URL
      onFileSelect(data.imageUrl, file);
    } catch (error) {
      setError(error.message);
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreview(null);
    setError('');
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Item Image
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Image className="h-4 w-4 mr-2" />
                Choose Image
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              or drag and drop an image here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {preview && !uploading && !error && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>Image uploaded successfully</span>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;