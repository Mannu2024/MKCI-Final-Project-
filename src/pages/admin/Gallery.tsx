import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Plus, Trash2, X, Image as ImageIcon, Upload } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  active: boolean;
}

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{id: string, url: string} | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    active: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const galleryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
      setImages(galleryData);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [externalUrl, setExternalUrl] = useState("");

  const handleOpenModal = () => {
    setFormData({
      title: "",
      category: "",
      active: true,
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setExternalUrl("");
    setUploadMethod('file');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setExternalUrl("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && selectedFiles.length === 0) {
      alert("Please select at least one image to upload.");
      return;
    }
    
    if (uploadMethod === 'url' && !externalUrl) {
      alert("Please enter an image URL.");
      return;
    }

    setUploading(true);
    try {
      if (uploadMethod === 'file' && selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file, index) => {
          const storageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          const finalImageUrl = await getDownloadURL(storageRef);
          
          const imageTitle = selectedFiles.length > 1 ? `${formData.title} ${index + 1}` : formData.title;
          
          await addDoc(collection(db, "gallery"), {
            ...formData,
            title: imageTitle,
            imageUrl: finalImageUrl,
            createdAt: new Date().toISOString()
          });
        });
        
        await Promise.all(uploadPromises);
      } else if (uploadMethod === 'url') {
        await addDoc(collection(db, "gallery"), {
          ...formData,
          imageUrl: externalUrl,
          createdAt: new Date().toISOString()
        });
      }

      handleCloseModal();
      fetchGallery();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      if (error?.code === 'storage/quota-exceeded' || error?.message?.includes('quota')) {
        alert("Firebase Storage Quota Exceeded. You have reached the free tier limit. Please use the 'Image URL' option instead to add images without using Firebase Storage.");
      } else {
        alert("Failed to upload image. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    setImageToDelete({ id, url: imageUrl });
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "gallery", imageToDelete.id));
      
      // 2. Try to delete from Storage (might fail if URL is external, e.g. picsum)
      try {
        const imageRef = ref(storage, imageToDelete.url);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.log("Could not delete from storage (might be external URL):", storageError);
      }

      fetchGallery();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image.");
    } finally {
      setImageToDelete(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "gallery", id), { active: !currentStatus });
      fetchGallery();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Gallery</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Upload Image
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No images found. Upload one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="aspect-square relative bg-gray-100">
                <img 
                  src={img.imageUrl} 
                  alt={img.title} 
                  className={`w-full h-full object-cover transition-opacity ${!img.active ? 'opacity-50 grayscale' : ''}`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(img.id, img.imageUrl)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {!img.active && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate" title={img.title}>{img.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {img.category}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">Visible</span>
                    <input 
                      type="checkbox" 
                      checked={img.active !== false} 
                      onChange={() => toggleActive(img.id, img.active !== false)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Upload Image</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="uploadForm" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Upload Method Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${uploadMethod === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${uploadMethod === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Image URL
                  </button>
                </div>

                {/* Image Upload Area */}
                {uploadMethod === 'file' ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Image Files (Multiple allowed)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-gray-50 relative overflow-hidden">
                      {previewUrls.length > 0 ? (
                        <div className="absolute inset-0 bg-gray-100 overflow-y-auto p-2">
                          <div className="grid grid-cols-3 gap-2">
                            {previewUrls.map((url, idx) => (
                              <div key={idx} className="aspect-square relative rounded-md overflow-hidden bg-white shadow-sm">
                                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                            <p className="text-white font-medium">Click to change files</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload files</span>
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB (Select multiple)</p>
                        </div>
                      )}
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                        onChange={handleFileChange}
                        required={uploadMethod === 'file'}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <input 
                      type="url" 
                      value={externalUrl} 
                      onChange={(e) => setExternalUrl(e.target.value)} 
                      required={uploadMethod === 'url'} 
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {externalUrl && (
                      <div className="mt-2 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={externalUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=Invalid+Image+URL')} />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Annual Function 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Events, Campus, Lab"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="active"
                    name="active" 
                    checked={formData.active} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Visible on website
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="uploadForm"
                disabled={uploading || (uploadMethod === 'file' && selectedFiles.length === 0) || (uploadMethod === 'url' && !externalUrl)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} /> Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!imageToDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setImageToDelete(null)}
      />
    </div>
  );
}
