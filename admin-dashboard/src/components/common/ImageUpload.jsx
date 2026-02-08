import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

function ImageUpload({ label, value, onChange, type = 'thumbnail', accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [showReuse, setShowReuse] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');

  // Sync preview with value when value is a URL
  useEffect(() => {
    if (value) {
      setUrlInput(value);
      setPreview(value);
    } else {
      setUrlInput('');
      setPreview(null);
    }
  }, [value]);

  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ['existing-images'],
    queryFn: () => adminApi.getExistingImages(),
    enabled: showReuse,
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const response = await adminApi.uploadImage(formData);
      if (response.data?.url) {
        onChange(response.data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image: ' + (error?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    const url = urlInput?.trim();
    if (url) {
      onChange(url);
      setPreview(url);
    }
  };

  const handleSelectExisting = (url) => {
    onChange(url);
    setPreview(url);
    setUrlInput(url);
    setShowReuse(false);
  };

  const handleClear = () => {
    setPreview(null);
    setUrlInput('');
    onChange('');
  };

  const brandingImages = existingData?.branding ?? [];
  const seriesImages = existingData?.series_images ?? [];
  const allReuseImages = [...brandingImages, ...seriesImages];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preview + clear */}
      {(preview || value) && (
        <div className="relative inline-block">
          <img
            src={preview || value}
            alt="Preview"
            className="w-32 h-40 object-cover rounded-lg border border-gray-300"
            onError={() => setPreview(null)}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Image URL input */}
      <div>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlSubmit}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            placeholder="Paste image URL and press Enter or blur"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm"
          >
            Use URL
          </button>
        </div>
      </div>

      {/* Upload file */}
      <div>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {uploading && <p className="mt-1 text-sm text-blue-600">Uploading...</p>}
      </div>

      {/* Reuse existing images */}
      <div>
        <button
          type="button"
          onClick={() => setShowReuse((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showReuse ? 'Hide' : 'Reuse'} existing images (branding & series covers)
        </button>
        {showReuse && (
          <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
            {loadingExisting ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : allReuseImages.length === 0 ? (
              <p className="text-sm text-gray-500">No existing images to show.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allReuseImages.map((item, idx) => (
                  <button
                    key={`${item.url}-${idx}`}
                    type="button"
                    onClick={() => handleSelectExisting(item.url)}
                    className="block rounded border border-gray-300 overflow-hidden hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <img
                      src={item.url}
                      alt={item.label || ''}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <span className="block text-xs text-gray-600 truncate px-1 py-0.5" title={item.label}>
                      {item.label || 'Image'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
