import { useState } from 'react';
import { adminApi } from '../../services/api';

function ImageUpload({ label, value, onChange, type = 'thumbnail', accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await adminApi.uploadImage(formData);
      if (response.success && response.data) {
        onChange(response.data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-40 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange('');
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {uploading && (
            <p className="mt-2 text-sm text-blue-600">Uploading...</p>
          )}
        </div>
      </div>
      {value && !preview && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or enter image URL"
          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

export default ImageUpload;

