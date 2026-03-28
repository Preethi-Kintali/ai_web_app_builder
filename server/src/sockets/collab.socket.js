// ============================================================
// COLLAB SOCKET — Real-Time Collaboration
// Namespace: /collab
// Room key: projectId
// ============================================================

/**
 * @param {import('socket.io').Server} io
 */
export const registerCollabHandlers = (io) => {
  const collabNs = io.of('/collab');

  // Track active users per room: Map<projectId, Set<socketId>>
  const rooms = new Map();

  collabNs.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // ── Join a project room ──────────────────────────────────
    socket.on('join-project', ({ projectId, user }) => {
      if (!projectId) return;

      // Leave previous room if switching
      if (currentRoom && currentRoom !== projectId) {
        socket.leave(currentRoom);
        _removeFromRoom(rooms, currentRoom, socket.id);
        collabNs.to(currentRoom).emit('user-left', { socketId: socket.id, user: currentUser });
      }

      currentRoom = projectId;
      currentUser = user || { name: 'Anonymous' };

      socket.join(projectId);
      _addToRoom(rooms, projectId, socket.id);

      // Notify others in room
      socket.to(projectId).emit('user-joined', {
        socketId: socket.id,
        user: currentUser,
      });

      // Send current room count back to joiner
      const count = rooms.get(projectId)?.size ?? 1;
      collabNs.to(projectId).emit('room-count', { count, projectId });
    });

    // ── Code change (throttled on client side) ───────────────
    socket.on('code-change', ({ projectId, files, changedFile }) => {
      if (!projectId) return;
      // Broadcast to everyone else in the room
      socket.to(projectId).emit('code-change', { files, changedFile, from: socket.id });
    });

    // ── Chat message ─────────────────────────────────────────
    socket.on('chat-message', ({ projectId, message }) => {
      if (!projectId) return;
      socket.to(projectId).emit('chat-message', { message, from: socket.id });
    });

    // ── Cursor position (optional, lightweight) ──────────────
    socket.on('cursor-move', ({ projectId, position, user }) => {
      if (!projectId) return;
      socket.to(projectId).emit('cursor-move', { position, user, from: socket.id });
    });

    // ── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      if (currentRoom) {
        _removeFromRoom(rooms, currentRoom, socket.id);
        const count = rooms.get(currentRoom)?.size ?? 0;
        collabNs.to(currentRoom).emit('user-left', { socketId: socket.id, user: currentUser });
        collabNs.to(currentRoom).emit('room-count', { count, projectId: currentRoom });
      }
    });
  });
};

// ── Helpers ──────────────────────────────────────────────────
function _addToRoom(rooms, projectId, socketId) {
  if (!rooms.has(projectId)) rooms.set(projectId, new Set());
  rooms.get(projectId).add(socketId);
}

function _removeFromRoom(rooms, projectId, socketId) {
  if (!rooms.has(projectId)) return;
  rooms.get(projectId).delete(socketId);
  if (rooms.get(projectId).size === 0) rooms.delete(projectId);
}
