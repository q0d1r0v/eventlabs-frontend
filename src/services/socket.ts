import { io, type Socket } from 'socket.io-client'
import { tokenStorage } from './api'

const socketURL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket

  socket = io(socketURL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: (cb) => {
      cb({ token: tokenStorage.getAccess() ?? '' })
    },
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

/**
 * Logout vaqtida socket'ni uzadi, lekin instance'ni saqlab qoladi.
 * Listenerlarni o'chirmaydi — App.vue'da setup paytida biriktirilgan
 * `new_notification` kabi global handlerlar keyingi loginda ham ishlaydi.
 * Auth callback har connect urunishida yangi tokenni qaytadan oladi.
 */
export function resetSocket(): void {
  if (socket?.connected) socket.disconnect()
}
