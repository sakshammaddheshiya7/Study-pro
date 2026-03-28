import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth, db, googleProvider,
  signInWithPopup, signInWithEmailAndPassword,
  signOut as firebaseSignOut, onAuthStateChanged,
  doc, setDoc, getDoc, serverTimestamp
} from '../config/firebase';
import { ADMIN_EMAIL } from '../utils/constants';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
        setUser(firebaseUser);
        setIsAdmin(isAdminUser);

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          } else {
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Student',
              photoURL: firebaseUser.photoURL || '',
              role: isAdminUser ? 'admin' : 'student',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              stats: {
                testsCompleted: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                totalTime: 0,
                averageAccuracy: 0
              },
              preferences: {
                examType: 'JEE Mains',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                dailyGoal: 50,
                notifications: true
              },
              weakChapters: [],
              strongChapters: []
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInAdmin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
      }
      console.error('Admin sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
      setUserProfile(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    signInWithGoogle,
    signInAdmin,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}