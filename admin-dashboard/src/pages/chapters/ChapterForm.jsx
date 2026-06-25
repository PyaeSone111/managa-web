import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import BulkImageUpload from '../../components/common/BulkImageUpload';

function ChapterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    series_id: '',
    chapter_number: '',
    title: '',
    is_published: true,
    published_at: new Date().toISOString().split('T')[0],
    pages: [],
  });

  const { data: seriesData } = useQuery({
    queryKey: ['admin-series'],
    queryFn: () => adminApi.getSeries({ per_page: 1000 }),
  });

  const { data: chapterResponse } = useQuery({
    queryKey: ['admin-chapter', id],
    queryFn: () => adminApi.getChapterById(id),
    enabled: isEdit && !!id,
  });

  const chapterData = chapterResponse?.data;

  useEffect(() => {
    if (isEdit && chapterData) {
      // Extract file names from image URLs if not present
      const pages = (chapterData.pages || []).map((page) => {
        // Use original_filename from database if available
        const originalFilename = page.original_filename || page.file_name;
        
        if (!originalFilename && page.image_url) {
          // Extract filename from URL as fallback
          const urlParts = page.image_url.split('/');
          const filename = urlParts[urlParts.length - 1];
          // Remove query parameters if any
          const cleanFilename = filename.split('?')[0];
          return {
            ...page,
            file_name: cleanFilename || `Page ${page.page_number}`,
            original_filename: cleanFilename || null,
          };
        }
        return {
          ...page,
          file_name: originalFilename || `Page ${page.page_number}`,
          original_filename: originalFilename || null,
        };
      });

      setFormData({
        series_id: chapterData.series_id || '',
        chapter_number: chapterData.chapter_number || '',
        title: chapterData.title || '',
        is_published: chapterData.is_published ?? true,
        published_at: chapterData.published_at
          ? new Date(chapterData.published_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        pages: pages,
      });
    }
  }, [isEdit, chapterData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateChapter(id, data) : adminApi.createChapter(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      queryClient.refetchQueries({ queryKey: ['admin-chapters'] });
      navigate('/dashboard/chapters');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.series_id) {
      alert('Please select a series');
      return;
    }

    if (formData.pages.length === 0) {
      alert('Please upload at least one page image');
      return;
    }

    try {
      await mutation.mutateAsync({
        ...formData,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
      });
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to save chapter'));
    }
  };

  const handlePagesUploaded = (images) => {
    setFormData((prev) => {
      // Append new images to existing pages
      const existingPages = prev.pages || [];
      const currentPageCount = existingPages.length;
      
      // Add new images with correct page numbers
      const newImages = images.map((img, index) => ({
        ...img,
        page_number: currentPageCount + index + 1,
      }));
      
      // Combine existing and new pages
      const allPages = [...existingPages, ...newImages];
      
      return {
        ...prev,
        pages: allPages,
      };
    });
  };

  const handlePageReorder = (fromIndex, toIndex) => {
    const newPages = [...formData.pages];
    const [removed] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, removed);
    // Update page numbers but preserve file names and original_filename
    const updatedPages = newPages.map((page, index) => ({
      ...page,
      page_number: index + 1,
      // Preserve file_name and original_filename if they exist
      file_name: page.file_name || `Page ${index + 1}`,
      original_filename: page.original_filename || page.file_name || null,
    }));
    setFormData((prev) => ({
      ...prev,
      pages: updatedPages,
    }));
  };

  // Drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...formData.pages];
    const draggedItem = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedItem);

    // Update page numbers
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      page_number: idx + 1,
      original_filename: page.original_filename || page.file_name || null,
    }));

    setFormData((prev) => ({
      ...prev,
      pages: updatedPages,
    }));

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handlePageDelete = (index) => {
    const newPages = formData.pages.filter((_, i) => i !== index);
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      page_number: idx + 1,
      // Preserve file_name and original_filename if they exist
      file_name: page.file_name || `Page ${idx + 1}`,
      original_filename: page.original_filename || page.file_name || null,
    }));
    setFormData((prev) => ({
      ...prev,
      pages: updatedPages,
    }));
  };

  const series = seriesData?.data || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Chapter' : 'Create New Chapter'}
          </h1>
          <button
            onClick={() => navigate('/dashboard/chapters')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Series *
            </label>
            <select
              value={formData.series_id}
              onChange={(e) => setFormData({ ...formData, series_id: e.target.value })}
              required
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-orange focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Select a series --</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Number *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.chapter_number}
                onChange={(e) =>
                  setFormData({ ...formData, chapter_number: parseFloat(e.target.value) })
                }
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-orange focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Optional chapter title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="rounded border-gray-300 text-red-orange focus:ring-red-orange"
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
          </div>

          <div>
            <BulkImageUpload
              label="Chapter Pages (Upload multiple images)"
              onImagesUploaded={handlePagesUploaded}
              maxFiles={100}
            />
          </div>

          {formData.pages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Order ({formData.pages.length} pages) - Drag to reorder
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4">
                {formData.pages.map((page, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group bg-gray-50 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                      draggedIndex === index
                        ? 'border-red-orange opacity-50 scale-95'
                        : 'border-gray-200 hover:border-red-orange/50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={page.image_url}
                        alt={`Page ${page.page_number}`}
                        className="w-full h-32 object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageReorder(index, index - 1);
                              }}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              title="Move left"
                            >
                              ←
                            </button>
                          )}
                          {index < formData.pages.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageReorder(index, index + 1);
                              }}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              title="Move right"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageDelete(index);
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        #{page.page_number}
                      </div>
                      <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                        ⋮⋮
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 font-medium truncate" title={page.original_filename || page.file_name || `Page ${page.page_number}`}>
                        {page.original_filename || page.file_name || `Page ${page.page_number}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/chapters')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading || formData.pages.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isLoading
                ? 'Saving...'
                : isEdit
                ? 'Update Chapter'
                : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ChapterForm;

