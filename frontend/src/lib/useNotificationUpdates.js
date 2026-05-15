import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// ============================================
// CONFIG — update this URL to match your backend
// e.g. 'http://192.168.1.100:5000' for local network
//      'https://your-backend.com' for production
// ============================================
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

/**
 * useNotificationUpdates
 *
 * Connects to the Socket.IO backend, joins the user's room,
 * and calls `onNewData` whenever a new transaction arrives.
 *
 * Benefits of Socket.IO:
 * - Automatic reconnection with exponential backoff
 * - Fallback to polling if WebSocket unavailable
 * - Rooms for private user communication
 * - Built-in error handling and callbacks
 * - Better cross-browser compatibility
 *
 * @param {string} userId - The logged-in user's ID
 * @param {function} onNewData - Callback: receives { transaction: {...} }
 * @returns {object} - Socket status info (optional)
 */
const useNotificationUpdates = (userId, onNewData) => {
  // Keep a stable ref to the latest callback so we never need to
  // reconnect the socket when the parent re-renders
  const callbackRef = useRef(onNewData);
  const socketRef = useRef(null);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onNewData;
  }, [onNewData]);

  // Main socket connection effect
  useEffect(() => {
    if (!userId || userId === 'YOUR_USER_ID') {
      console.warn('⚠️ useNotificationUpdates: Invalid userId provided');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...');

    // ── Initialize Socket.IO ────────────────────────────────
    const socket = io(BACKEND_URL, {
      // Use both WebSocket and polling as fallback
      transports: ['websocket', 'polling'],

      // Reconnection settings
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,

      // Timeouts
      connectTimeout: 10000,

      // Path (if your backend uses a custom path)
      // path: '/socket.io/',

      // Query params (optional, send userId during connection)
      query: {
        userId: userId,
      },

      // CORS settings (if backend is on different domain)
      // withCredentials: true,
    });

    // Store socket ref for potential manual operations
    socketRef.current = socket;

    // ── Connection Events ────────────────────────────────────
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected (ID:', socket.id, ')');

      // Emit 'join' event to tell backend this user is connected
      // Backend should add socket to a room named after userId
      socket.emit('join', { userId }, (response) => {
        if (response?.success) {
          console.log('✅ Joined user room:', userId);
        } else {
          console.warn('⚠️ Failed to join room:', response?.message);
        }
      });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      // Socket.IO will automatically attempt to reconnect
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server. Reason:', reason);
      // Reasons: 'io server disconnect', 'io client namespace disconnect',
      // 'ping timeout', 'transport close', 'transport error', etc.
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after max attempts');
    });

    // ── Transaction Event ────────────────────────────────────
    // Listen for 'new_transaction' from backend
    socket.on('new_transaction', (data) => {
      console.log('📩 New transaction received:', data);

      if (callbackRef.current && data?.transaction) {
        callbackRef.current({
          transaction: {
            id: data.transaction._id || Math.random(),
            _id: data.transaction._id,
            description: data.transaction.description || 'Transaction',
            merchant: data.transaction.merchant || 'Unknown Merchant',
            amount: data.transaction.amount || 0,
            category: data.transaction.category || 'Other',
            date: data.transaction.date || new Date().toISOString().split('T')[0],
            timestamp: data.transaction.timestamp || new Date().toISOString(),
            status: data.transaction.status || 'completed',
            type: data.transaction.type || 'expense',
            source: data.transaction.source || 'notification',
          },
          timestamp: new Date(),
        });
      }
    });

    // Optional: Listen for other events from backend
    socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // ── Cleanup on unmount ───────────────────────────────────
    return () => {
      console.log('🔌 Cleaning up Socket.IO connection...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_failed');
      socket.off('new_transaction');
      socket.off('notification');
      socket.off('error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Return socket info for debugging/advanced usage
  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  };
};

export default useNotificationUpdates;