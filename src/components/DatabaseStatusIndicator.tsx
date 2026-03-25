import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function DatabaseStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const handleOnline = () => {
      setStatus('checking');
    };
    const handleOffline = () => {
      setStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setStatus('disconnected');
    }

    // Listen to a document to check real-time firestore connection
    const unsub = onSnapshot(
      doc(db, 'system', 'connection_test'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) {
          // If we are offline according to the browser, it's definitely disconnected
          if (!navigator.onLine) {
            setStatus('disconnected');
          } else if (status !== 'connected') {
             // Still checking or waiting for server response
          }
        } else {
          setStatus('connected');
        }
      },
      (error) => {
        // If permission denied, it means we reached the server! So we are connected.
        if (error.code === 'permission-denied') {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      }
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
      status === 'disconnected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
      'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {status === 'connected' && <Wifi size={14} className="text-emerald-500" />}
      {status === 'disconnected' && <WifiOff size={14} className="text-rose-500" />}
      {status === 'checking' && <Loader2 size={14} className="text-amber-500 animate-spin" />}
      
      <span className="hidden sm:inline">
        {status === 'connected' ? 'Database Connected' : 
         status === 'disconnected' ? 'Database Offline' : 
         'Checking Connection...'}
      </span>
    </div>
  );
}
