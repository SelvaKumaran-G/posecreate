import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, RefreshCw, FileImage, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  description?: string;
  optional?: boolean;
  file?: File | null;
  value?: File | null;
  preview?: string | null;
  onFileSelect?: (file: File) => void;
  onChange?: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  required?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Image',
  description = 'Drag and drop or click to browse',
  optional,
  file: fileProp,
  value,
  preview: previewProp,
  onFileSelect,
  onChange,
  onRemove,
  accept = 'image/jpeg,image/png,image/webp',
  required,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFile = fileProp || value || null;
  const currentPreview = previewProp || localPreview || null;

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WebP are accepted.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    if (localPreview) URL.revokeObjectURL(localPreview);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    
    if (onFileSelect) onFileSelect(file);
    if (onChange) onChange(file);
  }, [onFileSelect, onChange, localPreview]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    e.target.value = '';
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setError(null);
    if (onRemove) onRemove();
    if (onChange) onChange(null);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {currentPreview || currentFile ? (
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50">
          <img
            src={currentPreview || ''}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              title="Replace"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleRemove}
              className="p-3 bg-red-500/80 backdrop-blur-sm rounded-xl hover:bg-red-500 transition-colors"
              title="Remove"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {currentFile && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FileImage className="w-4 h-4" />
                <span className="truncate">{currentFile.name}</span>
                <span className="text-white/50">{formatSize(currentFile.size)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-accent-500 bg-accent-500/10'
              : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900'
          }`}
        >
          {optional && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-slate-700 rounded text-xs text-gray-300 font-medium">
              Optional
            </div>
          )}
          <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragActive ? 'text-accent-400' : 'text-gray-500'}`} />
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          <p className="text-gray-500 text-sm">{description}</p>
          <p className="text-gray-600 text-xs mt-2">JPG, PNG, WebP • Max 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
