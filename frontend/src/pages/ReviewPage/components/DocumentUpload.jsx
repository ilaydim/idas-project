import React, { useState } from 'react';

const DocumentUpload = ({ onUpload, uiConfig }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onUpload(file);
    };

    return (
        <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="upload-content">
                <div className="upload-icon">📄</div>
                <h2>{uiConfig?.review.upload_title || "Upload Document"}</h2>
                <p>{uiConfig?.review.upload_hint || "Drag and drop your files here"}</p>
                <button className="browse-btn" onClick={() => document.getElementById('file-input').click()}>
                    Browse Files
                </button>
                <input
                    id="file-input"
                    type="file"
                    hidden
                    accept=".docx,.pdf"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default DocumentUpload;
