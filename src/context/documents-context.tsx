import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocumentReaderItem } from '@/components/document-reader';
import { INITIAL_DEMO_DOCUMENTS } from '@/constants/initial-documents';
import { useAuth } from '@/context/auth-context';
import {
  apiFetchDocuments,
  apiCreateDocument,
  apiDeleteDocument,
} from '@/services/api-client';

const STORAGE_KEY_DOCS = '@docuvault_uploaded_documents';

interface DocumentsContextType {
  documents: DocumentReaderItem[];
  allDocuments: DocumentReaderItem[];
  addDocument: (doc: DocumentReaderItem) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  isLoadingDocs: boolean;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { user, isAdminMode } = useAuth();
  const isUserAdmin = isAdminMode || user.role === 'Admin';

  const [documents, setDocuments] = useState<DocumentReaderItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Sync documents from backend API with fallback to AsyncStorage
  const refreshDocuments = useCallback(async () => {
    try {
      // 1. Read current local cache from AsyncStorage
      const rawDocs = await AsyncStorage.getItem(STORAGE_KEY_DOCS);
      let localDocs: DocumentReaderItem[] = [];
      if (rawDocs) {
        try {
          const parsed = JSON.parse(rawDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localDocs = parsed;
          }
        } catch {
          // ignore parse error
        }
      }

      if (localDocs.length === 0) {
        localDocs = INITIAL_DEMO_DOCUMENTS;
        await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(localDocs)).catch(() => {});
      }

      // 2. Fetch from MongoDB: If Admin fetch all, if Employee fetch only their own
      const queryEmail = isUserAdmin ? undefined : (user.email ? user.email.toLowerCase() : undefined);
      const res = await apiFetchDocuments(queryEmail);
      if (res.success && Array.isArray(res.documents) && res.documents.length > 0) {
        // Merge backend documents with local documents by ID
        const docMap = new Map<string, DocumentReaderItem>();
        localDocs.forEach((d) => docMap.set(d.id, d));
        res.documents.forEach((d) => docMap.set(d.id, d));
        const merged = Array.from(docMap.values());
        setDocuments(merged);
        await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(merged)).catch(() => {});

        // Auto-push any local documents missing from backend to MongoDB
        const backendDocIds = new Set(res.documents.map((d) => d.id));
        const unsyncedDocs = localDocs.filter((d) => !backendDocIds.has(d.id));
        if (unsyncedDocs.length > 0) {
          unsyncedDocs.forEach((d) => apiCreateDocument(d).catch(() => {}));
        }
        return;
      }

      // If backend is unreachable or returned empty, ensure localDocs are displayed
      if (localDocs.length > 0) {
        setDocuments(localDocs);
      }
    } catch {
      // Backend offline or error - keep cached documents
    }
  }, [isUserAdmin, user.email]);

  // Hydrate documents on startup
  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        // Step 1: Load from local cache for instant UI rendering
        const rawDocs = await AsyncStorage.getItem(STORAGE_KEY_DOCS);
        let localDocs: DocumentReaderItem[] = [];
        if (rawDocs && isMounted) {
          try {
            const parsed = JSON.parse(rawDocs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localDocs = parsed;
              setDocuments(parsed);
            }
          } catch {
            // ignore
          }
        }

        if (localDocs.length === 0 && isMounted) {
          localDocs = INITIAL_DEMO_DOCUMENTS;
          setDocuments(INITIAL_DEMO_DOCUMENTS);
          await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(INITIAL_DEMO_DOCUMENTS)).catch(() => {});
        }

        // Step 2: Fetch latest from MongoDB backend if reachable
        const queryEmail = isUserAdmin ? undefined : (user.email ? user.email.toLowerCase() : undefined);
        const res = await apiFetchDocuments(queryEmail);
        if (res.success && Array.isArray(res.documents) && res.documents.length > 0 && isMounted) {
          const docMap = new Map<string, DocumentReaderItem>();
          localDocs.forEach((d) => docMap.set(d.id, d));
          res.documents.forEach((d) => docMap.set(d.id, d));
          const merged = Array.from(docMap.values());
          setDocuments(merged);
          await AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(merged)).catch(() => {});

          const backendDocIds = new Set(res.documents.map((d) => d.id));
          const unsyncedDocs = localDocs.filter((d) => !backendDocIds.has(d.id));
          if (unsyncedDocs.length > 0) {
            unsyncedDocs.forEach((d) => apiCreateDocument(d).catch(() => {}));
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
  }, [isUserAdmin, user.email]);

  const addDocument = async (doc: DocumentReaderItem) => {
    const formattedDoc: DocumentReaderItem = {
      ...doc,
      employeeEmail: (doc.employeeEmail || user.email || 'employee@enterprise.com').trim().toLowerCase(),
      employeeName: (doc.employeeName || user.name || 'Employee').trim(),
    };

    // 1. Optimistically update local UI & cache
    setDocuments((prev) => {
      const updated = [formattedDoc, ...prev.filter((d) => d.id !== formattedDoc.id)];
      AsyncStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to persist document to storage:', err)
      );
      return updated;
    });

    // 2. Persist to MongoDB backend
    try {
      await apiCreateDocument(formattedDoc);
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

  // Privacy isolation:
  // - Admin sees all documents across the organization.
  // - Employee only sees documents that belong to their own account.
  const visibleDocuments = isUserAdmin
    ? documents
    : documents.filter((d) => {
        const docEmail = (d.employeeEmail || '').trim().toLowerCase();
        const userEmail = (user.email || '').trim().toLowerCase();
        const docName = (d.employeeName || '').trim().toLowerCase();
        const userName = (user.name || '').trim().toLowerCase();
        return (userEmail && docEmail === userEmail) || (userName && docName === userName);
      });

  return (
    <DocumentsContext.Provider
      value={{
        documents: visibleDocuments,
        allDocuments: documents,
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
