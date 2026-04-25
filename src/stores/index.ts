import { createPinia } from 'pinia'

export const pinia = createPinia()

export { useAuthStore } from './auth'
export { useToastStore } from './toast'
export { useConferencesStore } from './conferences'
export { useRegistrationsStore } from './registrations'
export { useNotificationsStore } from './notifications'

export default pinia
