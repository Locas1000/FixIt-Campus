// src/components/domain/CreateTicketModal.jsx
import React, { useState, useRef } from 'react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('Medium');

    // Image State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a local URL so the user can preview what they are uploading
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Because we are sending a file, we MUST use FormData instead of a standard JSON object
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('priority', priority);
            formData.append('creatorId', user?.id || 1);

            if (selectedFile) {
                // 'evidence' must match what Mathew's multer middleware is looking for: upload.single('evidence')
                formData.append('evidence', selectedFile);
            }

            // Axios automatically sets the multipart/form-data header when you pass a FormData object
            const newTicket = await ticketService.createTicket(formData);

            // Pass the new ticket up to update the feed, then close and reset
            if (onTicketCreated) onTicketCreated(newTicket);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setPriority('Medium');
        clearFile();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 1050,
                padding: '20px'
            }}
        >
            <div
                className="rounded-3 shadow-lg d-flex flex-column"
                style={{
                    width: '100%',
                    maxWidth: '550px',
                    maxHeight: '90vh',
                    backgroundColor: 'var(--auth-input-bg)',
                    border: '1px solid var(--auth-border-color)',
                    color: 'var(--bs-body-color)'
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ borderColor: 'var(--auth-border-color)' }}>
                    <h5 className="mb-0 fw-semibold">New Issue</h5>
                    <button onClick={handleClose} className="btn-close btn-close-white" aria-label="Close"></button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-grow-1">
                    {error && <div className="alert alert-danger p-2 fs-6">{error}</div>}

                    <form id="createTicketForm" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ backgroundColor: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)', color: 'var(--bs-body-color)' }}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., A/C leaking in Room 101"
                                required
                            />
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                <select
                                    className="form-select"
                                    style={{ backgroundColor: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)', color: 'var(--bs-body-color)' }}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select category...</option>
                                    <option value="HVAC">HVAC</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Structural">Structural</option>
                                    <option value="IT">IT Infrastructure</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
                                <select
                                    className="form-select"
                                    style={{ backgroundColor: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)', color: 'var(--bs-body-color)' }}
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                style={{ backgroundColor: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)', color: 'var(--bs-body-color)', resize: 'none' }}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide detailed information about the issue..."
                                required
                            ></textarea>
                        </div>

                        {/* Image Upload Zone */}
                        <div className="mb-2">
                            <label className="form-label text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence (Optional)</label>

                            {!previewUrl ? (
                                <div
                                    className="d-flex flex-column align-items-center justify-content-center p-4 rounded"
                                    style={{ border: '1px dashed var(--bs-secondary-color)', backgroundColor: 'var(--auth-input-bg)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--auth-btn-bg)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--auth-input-bg)'}
                                >
                                    <i className="bi bi-camera text-muted mb-2" style={{ fontSize: '1.5rem' }}></i>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Click to attach an image</span>
                                </div>
                            ) : (
                                <div className="position-relative d-inline-block rounded overflow-hidden" style={{ border: '1px solid var(--auth-border-color)' }}>
                                    <img src={previewUrl} alt="Preview" style={{ height: '120px', width: 'auto', display: 'block' }} />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}
                                        onClick={clearFile}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="d-none"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={handleFileChange}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-3 border-top d-flex justify-content-end gap-2" style={{ borderColor: 'var(--auth-border-color)', backgroundColor: 'var(--bs-body-bg)' }}>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit" form="createTicketForm" className="btn" style={{ backgroundColor: 'var(--bs-body-color)', color: 'var(--bs-body-bg)' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
}