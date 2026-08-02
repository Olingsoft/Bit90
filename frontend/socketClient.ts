import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return socket;
}
