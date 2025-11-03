import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { XIcon, DocumentDownloadIcon } from '../icons/Icon';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType?: 'pdf' | 'image' | 'document' | 'unknown';
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType = 'unknown'
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setError(null);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isImage = documentType === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(documentUrl);
  const isPdf = documentType === 'pdf' || /\.pdf$/i.test(documentUrl);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download document. Please try again.');
    }
  };

  const handleOpenInNewTab = () => {
    try {
      window.open(documentUrl, '_blank');
    } catch (err) {
      setError('Failed to open document. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold">Document Viewer</h2>
            <p className="text-sm text-muted-foreground mt-1">{documentName}</p>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-auto bg-muted/20">
          {error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center space-y-4">
                <div className="text-red-500 text-lg font-semibold">{error}</div>
                <p className="text-muted-foreground">
                  The document could not be displayed in the browser. Please download it to view.
                </p>
              </div>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center p-6 min-h-full">
              <img 
                src={documentUrl} 
                alt={documentName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={() => setError('Failed to load image. The file may be corrupted or unavailable.')}
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-full">
              <iframe
                src={`${documentUrl}#toolbar=1`}
                className="w-full h-full border-none"
                title={documentName}
                onError={() => setError('Failed to load PDF. Please download to view.')}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center space-y-6">
                <div className="text-6xl">📄</div>
                <div>
                  <h3 className="text-lg font-semibold">Document Type Not Supported</h3>
                  <p className="text-muted-foreground mt-2">
                    This document type cannot be previewed in the browser.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    File: {documentName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </Button>
          <Button 
            type="button" 
            onClick={handleDownload}
          >
            <DocumentDownloadIcon className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
