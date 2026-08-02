import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        if (currentUser.email === 'ronitadhikari690@gmail.com') {
          setIsAdmin(true);
        } else {
          // Check if they are in admins collection
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          } catch (e) {
            console.error('Error checking admin status', e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (
        e?.code === 'auth/cancelled-popup-request' ||
        e?.code === 'auth/popup-closed-by-user' ||
        e?.message?.includes('cancelled-popup-request') ||
        e?.message?.includes('popup-closed-by-user')
      ) {
        console.warn('Google sign-in popup was closed or cancelled by user.');
      } else {
        console.error('Google sign-in error:', e);
        setLoginError(e?.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setLoginError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, isLoggingIn, loginError, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
