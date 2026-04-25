import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { connectSocket, getSocket } from '@/services/socket'

type EventMap = Record<string, (payload: any) => void>

export interface UseSocketOptions {
  /** Avtomatik tarzda mount'da ulanish */
  autoConnect?: boolean
  /** Komponent unmount bo'lganda socket'ni uzish (boshqa joyda ishlatilmasa) */
  disconnectOnUnmount?: boolean
}

export function useSocket(events: EventMap = {}, options: UseSocketOptions = {}) {
  const socket: Socket = getSocket()
  const { autoConnect = true, disconnectOnUnmount = false } = options

  const connected = ref(socket.connected)

  const onConnect = () => {
    connected.value = true
  }
  const onDisconnect = () => {
    connected.value = false
  }

  socket.on('connect', onConnect)
  socket.on('disconnect', onDisconnect)

  const handlers = Object.entries(events)

  const attach = () => {
    handlers.forEach(([event, handler]) => socket.on(event, handler))
  }

  const detach = () => {
    handlers.forEach(([event, handler]) => socket.off(event, handler))
  }

  // Listenerlarni darhol biriktiramiz (mount kutmasdan), shunda socket
  // tezroq ulansa ham xabarlarni qo'lga olamiz.
  attach()

  onMounted(() => {
    if (autoConnect) connectSocket()
  })

  onBeforeUnmount(() => {
    detach()
    socket.off('connect', onConnect)
    socket.off('disconnect', onDisconnect)
    if (disconnectOnUnmount && socket.connected) {
      socket.disconnect()
    }
  })

  return {
    socket,
    connected,
    emit: <T = unknown>(event: string, data?: T) => socket.emit(event, data),
    on: <T = unknown>(event: string, handler: (payload: T) => void) => {
      socket.on(event, handler as (...args: unknown[]) => void)
    },
    off: <T = unknown>(event: string, handler: (payload: T) => void) => {
      socket.off(event, handler as (...args: unknown[]) => void)
    },
  }
}
