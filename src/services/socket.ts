import { io, type Socket } from 'socket.io-client'

const socketURL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket

  socket = io(socketURL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: () => ({
      token: localStorage.getItem('access_token') ?? '',
    }),
  })

  return socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect()
}
