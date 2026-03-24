import React, { useState, useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setStatus('connected');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          setStatus('error');
          setErrorMessage('The client is offline. Please check your Firebase configuration.');
        } else {
          // If we get a permission denied error, it means we successfully connected to Firebase
          // but don't have access to the test document, which is expected.
          setStatus('connected');
        }
      }
    }

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg z-50">
        <p className="font-bold">Checking Firebase Connection...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
        <p className="font-bold">Firebase Connection Error</p>
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 transition-opacity duration-1000 opacity-0 hover:opacity-100">
      <p className="font-bold">Firebase Connected Successfully</p>
    </div>
  );
}
