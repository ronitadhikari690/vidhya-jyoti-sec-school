import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, dbId);

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Log full auth and debugging details to console only (never expose in thrown message)
  console.error('Firestore Error:', {
    operationType,
    path,
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  });

  // Construct user-friendly error message without sensitive auth information
  let userMessage = `Database error during ${operationType} operation`;
  if (path) {
    userMessage += ` on ${path}`;
  }
  if (errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
    userMessage = 'Permission denied: You do not have permission to perform this action.';
  } else if (errorMessage) {
    userMessage += `: ${errorMessage}`;
  }

  throw new Error(userMessage);
}
