
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

type AuthCallback = () => void;
type AuthErrorCallback = (error: any) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(
    authInstance: Auth, 
    onSuccess?: AuthCallback, 
    onError?: AuthErrorCallback
): void {
  signInAnonymously(authInstance)
    .then(() => onSuccess?.())
    .catch((error) => onError?.(error));
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
    authInstance: Auth, 
    email: string, 
    password: string,
    onSuccess?: (userCredential: UserCredential) => void,
    onError?: AuthErrorCallback
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => onSuccess?.(userCredential))
    .catch((error) => onError?.(error));
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
    authInstance: Auth, 
    email: string, 
    password: string,
    onSuccess?: AuthCallback,
    onError?: AuthErrorCallback
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(() => onSuccess?.())
    .catch((error) => onError?.(error));
}
