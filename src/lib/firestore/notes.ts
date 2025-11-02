
'use client';

import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface Note {
  id?: string;
  content: string;
  createdAt: Date;
}

/**
 * Adds a new note for a specific user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param content - The content of the note.
 * @param onComplete - Callback function executed on successful addition.
 */
export function addNote(
  firestore: Firestore,
  userId: string,
  content: string,
  onComplete: () => void
): void {
  if (!userId) {
    console.error("User ID is required to add a note.");
    return;
  }
  const notesCollection = collection(firestore, `users/${userId}/notes`);
  const dataToSave = {
    content,
    createdAt: serverTimestamp()
  };

  addDoc(notesCollection, dataToSave)
    .then(() => {
        onComplete();
    })
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: notesCollection.path,
        operation: 'create',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Updates an existing note.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param noteId - The ID of the note to update.
 * @param content - The new content for the note.
 */
export function updateNote(
  firestore: Firestore,
  userId: string,
  noteId: string,
  content: string
): void {
  if (!userId || !noteId) return;
  const noteDoc = doc(firestore, `users/${userId}/notes`, noteId);
  const updateData = { content };

  updateDoc(noteDoc, updateData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: noteDoc.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Deletes a note.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param noteId - The ID of the note to delete.
 */
export function deleteNote(
  firestore: Firestore,
  userId: string,
  noteId: string
): void {
  if (!userId || !noteId) return;
  const noteDoc = doc(firestore, `users/${userId}/notes`, noteId);

  deleteDoc(noteDoc)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: noteDoc.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Retrieves all notes for a user in real-time.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param onUpdate - Callback function called with the updated list of notes.
 * @returns An unsubscribe function for the real-time listener.
 */
export function getNotes(
  firestore: Firestore,
  userId: string,
  onUpdate: (notes: Note[]) => void
): () => void {
  if (!userId) {
      onUpdate([]);
      return () => {};
  }
  const notesCollection = collection(firestore, `users/${userId}/notes`);
  const q = query(notesCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return {
        id: doc.id,
        content: data.content,
        createdAt: createdAt,
      } as Note;
    });
    onUpdate(notes);
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/notes`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    onUpdate([]);
  });

  return unsubscribe;
}

    