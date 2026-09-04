import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { compressImage } from '../utils/imageCompressor';

interface SettingsContextType {
  settings: any;
  updateSetting: (key: string, value: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });
    return unsub;
  }, []);

  const updateSetting = async (key: string, value: any) => {
    let valToSave = value;
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      valToSave = await compressImage(value, 1000, 1000, 0.75);
    }
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, { [key]: valToSave }, { merge: true });
    } catch (e: any) {
      console.error('Error updating setting:', key, e);
      handleFirestoreError(e, OperationType.UPDATE, 'settings/general');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
