import React, { useState, useRef } from 'react';
import '../styles/FileUpload.css';

const FileUpload = ({ threadId, onFileUpload, onFileRemove, uploadedFile }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const handleFile = async (file) => {
    setError('');
    
    // Validate file type
    const validTypes = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidType = validTypes.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
      setError('Only PDF and DOCX files are supported');
      return;
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds 25MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('threadId', threadId);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      if (onFileUpload) {
        onFileUpload(data.file);
      }
    } catch (err) {
      setError(err.message || 'Error uploading file');
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveFile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/file/${threadId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove file');
      }

      if (onFileRemove) {
        onFileRemove();
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Error removing file');
      console.error('File removal error:', err);
    }
  };

  return (
    <div className="file-upload-container">
      {!uploadedFile ? (
        <div
          className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept=".pdf,.docx,.doc"
            disabled={loading}
            style={{ display: 'none' }}
          />
          
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Upload PDF or DOCX file"
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                <span className="upload-icon">📎</span>
                {dragActive ? 'Drop file here' : 'Upload PDF or DOCX'}
              </>
            )}
          </button>
          
          <p className="upload-hint">
            {dragActive ? 'Release to upload' : 'Drag and drop or click to browse'}
          </p>
        </div>
      ) : (
        <div className="file-info">
          <div className="file-details">
            <span className="file-icon">
              {uploadedFile.fileType === 'pdf' ? '📄' : '📝'}
            </span>
            <div className="file-meta">
              <p className="file-name">{uploadedFile.fileName}</p>
              <p className="file-size">
                {(uploadedFile.textLength / 1024).toFixed(2)} KB of text extracted
              </p>
            </div>
          </div>
          <button
            className="remove-button"
            onClick={handleRemoveFile}
            title="Remove uploaded file"
          >
            ✕
          </button>
        </div>
      )}

      {error && <div className="file-error">{error}</div>}
    </div>
  );
};

export default FileUpload;
