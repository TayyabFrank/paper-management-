import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocumentReaderItem } from '@/components/document-reader';
import {
  apiFetchDocuments,
  apiCreateDocument,
  apiDeleteDocument,
} from '@/services/api-client';

const STORAGE_KEY_DOCS = '@docuvault_uploaded_documents';

interface DocumentsContextType {
  documents: DocumentReaderItem[];
  addDocument: (doc: DocumentReaderItem) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  isLoadingDocs: boolean;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentReaderItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Sync documents from backend API with fallback to AsyncStorage
  const refreshDocuments = useCallback(async () => {
    try {
      const res = await apiFetchDocuments();
      if (res.success && Array.isArray(res.documents) && res.documents.length > 0) {
        setDocuments(res.documents);
        await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(res.documents)).catch(() => {});
        return;
      }
    } catch {
      // Backend offline or error - keep cached documents
    }
  }, []);

  // Hydrate documents on startup
  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        // Step 1: Load from local cache for instant UI rendering
        const rawDocs = await AsyncStorage.getItem(STORAGE_KEY_DOCS);
        if (rawDocs && isMounted) {
          const parsed = JSON.parse(rawDocs);
          if (Array.isArray(parsed)) {
            setDocuments(parsed);
          }
        }

        // Step 2: Fetch latest from MongoDB backend if reachable
        const res = await apiFetchDocuments();
        if (res.success && Array.isArray(res.documents) && isMounted) {
          if (res.documents.length > 0) {
            setDocuments(res.documents);
            await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(res.documents)).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Failed to load documents:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDocs(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const addDocument = async (doc: DocumentReaderItem) => {
    // 1. Optimistically update local UI & cache
    setDocuments((prev) => {
      const updated = [doc, ...prev.filter((d) => d.id !== doc.id)];
      AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to persist document to storage:', err)
      );
      return updated;
    });

    // 2. Persist to MongoDB backend
    try {
      await apiCreateDocument(doc);
    } catch (err) {
      console.warn('Failed to save document to backend:', err);
    }
  };

  const deleteDocument = async (id: string) => {
    // 1. Optimistically update local UI & cache
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to update storage after document deletion:', err)
      );
      return updated;
    });

    // 2. Delete from MongoDB backend
    try {
      await apiDeleteDocument(id);
    } catch (err) {
      console.warn('Failed to delete document from backend:', err);
    }
  };

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        addDocument,
        deleteDocument,
        refreshDocuments,
        isLoadingDocs,
      }}
    >
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
