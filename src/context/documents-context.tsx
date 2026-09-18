import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocumentReaderItem } from '@/components/document-reader';

const STORAGE_KEY_DOCS = '@docuvault_uploaded_documents';

interface DocumentsContextType {
  documents: DocumentReaderItem[];
  addDocument: (doc: DocumentReaderItem) => void;
  deleteDocument: (id: string) => void;
  isLoadingDocs: boolean;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentReaderItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Hydrate documents on app startup
  useEffect(() => {
    let isMounted = true;

    async function loadStoredDocuments() {
      try {
        const rawDocs = await AsyncStorage.getItem(STORAGE_KEY_DOCS);
        if (rawDocs && isMounted) {
          const parsed = JSON.parse(rawDocs);
          if (Array.isArray(parsed)) {
            setDocuments(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load documents from storage:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDocs(false);
        }
      }
    }

    loadStoredDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const addDocument = async (doc: DocumentReaderItem) => {
    setDocuments((prev) => {
      const updated = [doc, ...prev.filter((d) => d.id !== doc.id)];
      AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to persist document to storage:', err)
      );
      return updated;
    });
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to update storage after document deletion:', err)
      );
      return updated;
    });
  };

  return (
    <DocumentsContext.Provider value={{ documents, addDocument, deleteDocument, isLoadingDocs }}>
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

