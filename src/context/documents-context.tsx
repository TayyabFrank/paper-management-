import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DocumentReaderItem } from '@/components/document-reader';

interface DocumentsContextType {
  documents: DocumentReaderItem[];
  addDocument: (doc: DocumentReaderItem) => void;
  deleteDocument: (id: string) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  // Start with 0 hardcoded documents as requested by user.
  // Documents will only be uploaded and added from the upload page.
  const [documents, setDocuments] = useState<DocumentReaderItem[]>([]);

  const addDocument = (doc: DocumentReaderItem) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DocumentsContext.Provider value={{ documents, addDocument, deleteDocument }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
