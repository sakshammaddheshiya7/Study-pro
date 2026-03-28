import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  db, storage,
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, writeBatch, serverTimestamp,
  ref, uploadBytes, getDownloadURL, deleteObject
} from '../config/firebase';
import toast from 'react-hot-toast';

const DatabaseContext = createContext(null);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
}

export function DatabaseProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = useCallback(async (questionData) => {
    try {
      const docRef = await addDoc(collection(db, 'questions'), {
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Question added successfully');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to add question');
      throw error;
    }
  }, []);

  const updateQuestion = useCallback(async (id, data) => {
    try {
      await updateDoc(doc(db, 'questions', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast.success('Question updated');
    } catch (error) {
      toast.error('Failed to update question');
      throw error;
    }
  }, []);

  const deleteQuestion = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
      throw error;
    }
  }, []);

  const bulkUploadQuestions = useCallback(async (questionsArray) => {
    try {
      setLoading(true);
      const batch = writeBatch(db);
      const chunks = [];

      for (let i = 0; i < questionsArray.length; i += 500) {
        chunks.push(questionsArray.slice(i, i + 500));
      }

      let uploaded = 0;
      for (const chunk of chunks) {
        const batchRef = writeBatch(db);
        for (const q of chunk) {
          const docRef = doc(collection(db, 'questions'));
          batchRef.set(docRef, {
            ...q,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        await batchRef.commit();
        uploaded += chunk.length;
      }

      toast.success(`${uploaded} questions uploaded successfully`);
      return uploaded;
    } catch (error) {
      toast.error('Bulk upload failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      let q = collection(db, 'questions');
      const constraints = [];

      if (filters.examType) constraints.push(where('examType', '==', filters.examType));
      if (filters.subject) constraints.push(where('subject', '==', filters.subject));
      if (filters.difficulty) constraints.push(where('difficulty', '==', filters.difficulty));
      if (filters.questionType) constraints.push(where('questionType', '==', filters.questionType));
      if (filters.chapter) constraints.push(where('chapter', '==', filters.chapter));

      const queryRef = constraints.length > 0
        ? query(q, ...constraints)
        : query(q);

      const snapshot = await getDocs(queryRef);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuestions(results);
      return results;
    } catch (error) {
      console.error('Fetch questions error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToQuestions = useCallback((filters, callback) => {
    let q = collection(db, 'questions');
    const constraints = [];

    if (filters?.examType) constraints.push(where('examType', '==', filters.examType));
    if (filters?.subject) constraints.push(where('subject', '==', filters.subject));

    const queryRef = constraints.length > 0 ? query(q, ...constraints) : query(q);

    return onSnapshot(queryRef, (snapshot) => {
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(results);
    });
  }, []);

  const uploadFile = useCallback(async (file, path) => {
    try {
      const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      toast.error('File upload failed');
      throw error;
    }
  }, []);

  const saveTestAttempt = useCallback(async (attemptData) => {
    try {
      const docRef = await addDoc(collection(db, 'testAttempts'), {
        ...attemptData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      toast.error('Failed to save test');
      throw error;
    }
  }, []);

  const getTestHistory = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'testAttempts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching test history:', error);
      return [];
    }
  }, []);

  const addLog = useCallback(async (logData) => {
    try {
      await addDoc(collection(db, 'logs'), {
        ...logData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Log error:', error);
    }
  }, []);

  const sendNotification = useCallback(async (notification) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        read: false
      });
      toast.success('Notification sent');
    } catch (error) {
      toast.error('Failed to send notification');
      throw error;
    }
  }, []);

  const getNotifications = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('target', 'in', ['all', userId]),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Notifications error:', error);
      return [];
    }
  }, []);

  const saveApiKey = useCallback(async (provider, key) => {
    try {
      await setDoc(doc(db, 'apiKeys', provider), {
        key,
        provider,
        updatedAt: serverTimestamp()
      });
      toast.success(`${provider} API key saved`);
    } catch (error) {
      toast.error('Failed to save API key');
      throw error;
    }
  }, []);

  const getApiKey = useCallback(async (provider) => {
    try {
      const docSnap = await getDoc(doc(db, 'apiKeys', provider));
      return docSnap.exists() ? docSnap.data().key : null;
    } catch (error) {
      return null;
    }
  }, []);

  const value = {
    questions,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUploadQuestions,
    fetchQuestions,
    subscribeToQuestions,
    uploadFile,
    saveTestAttempt,
    getTestHistory,
    addLog,
    sendNotification,
    getNotifications,
    saveApiKey,
    getApiKey
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
