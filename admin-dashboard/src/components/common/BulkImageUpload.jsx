import { useState } from 'react';
import { adminApi } from '../../services/api';

function BulkImageUpload({ label, onImagesUploaded, maxFiles = 50 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      // Append files - Laravel will treat multiple files with same key as array
      files.forEach((file) => {
        formData.append('files[]', file);
      });
      formData.append('type', 'chapter');

      const response = await adminApi.bulkUploadImages(formData);
      if (response.success && response.data) {
        const images = response.data.map((img, index) => ({
          page_number: index + 1,
          image_url: img.url,
          width: img.width,
          height: img.height,
          file_size: img.file_size,
          file_name: img.original_filename || files[index]?.name || `image_${index + 1}`,
          original_filename: img.original_filename || files[index]?.name || null,
        }));
        setUploadedImages(images);
        onImagesUploaded(images);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />
      {uploading && (
        <p className="text-sm text-red-orange">Uploading images...</p>
      )}
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {uploadedImages.length} images uploaded successfully
          </p>
          <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.image_url}
                  alt={`Page ${img.page_number}`}
                  className="w-full h-20 object-cover rounded border border-gray-300"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-0.5">
                  {img.page_number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkImageUpload;

