import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const COLLAB_SERVER_URL = 'http://localhost:5000/collab';

export function useCollabSocket(projectId, user, onCodeChange, onChatMessage) {
  const socketRef = useRef(null);
  const [collabCount, setCollabCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId || !user?.id) return;

    let isComponentMounted = true;

    // Connect to namespace with fallback support
    const socket = io(COLLAB_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback to polling if WS is blocked
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      if (!isComponentMounted) return;
      setIsConnected(true);
      socket.emit('join-project', { projectId, user: { name: user.name, id: user.id } });
    });

    socket.on('connect_error', (err) => {
      console.warn('[Collab] Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      if (isComponentMounted) setIsConnected(false);
    });

    // Handle room count updates
    socket.on('room-count', ({ count }) => {
      if (isComponentMounted) setCollabCount(count);
    });

    // Handle incoming code changes
    socket.on('code-change', ({ files, changedFile, from }) => {
      if (isComponentMounted && onCodeChange) onCodeChange(files, changedFile, from);
    });

    // Handle incoming chat
    socket.on('chat-message', ({ message, from }) => {
      if (isComponentMounted && onChatMessage) onChatMessage(message, from);
    });

    return () => {
      isComponentMounted = false;
      if (socket) {
        // Use a short delay before disconnecting to avoid "closed before established" warnings 
        // in React Strict Mode's double-mount cycle.
        setTimeout(() => {
          socket.disconnect();
        }, 50);
      }
    };
  }, [projectId, user?.id]);

  // Provide emitters for local changes
  const emitCodeChange = useCallback((files, changedFile) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('code-change', { projectId, files, changedFile });
    }
  }, [projectId]);

  const emitChatMessage = useCallback((message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat-message', { projectId, message });
    }
  }, [projectId]);

  return {
    collabCount,
    isConnected,
    emitCodeChange,
    emitChatMessage
  };
}
