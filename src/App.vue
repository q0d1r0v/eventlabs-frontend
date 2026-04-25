<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useSocket } from '@/composables/useSocket'
import { useToast } from '@/composables/useToast'
import { connectSocket, disconnectSocket } from '@/services/socket'
import type { Notification } from '@/types'

const route = useRoute()
const auth = useAuthStore()
const notif = useNotificationsStore()
const toast = useToast()

const layout = computed<'auth' | 'default'>(() =>
  route.meta.layout === 'auth' ? 'auth' : 'default',
)

const onNewNotification = (n: Notification) => {
  notif.prepend(n)
  toast.info(n.message, { title: n.title, duration: 5000 })
}

// Socket qayta ulanganda (masalan tarmoq uzilib qaytsa) o'qilmaganlarni
// qayta sinxronlaymiz — push paytida o'tkazib yuborilgan xabarlar uchun
const onReconnect = () => {
  if (auth.isAuthenticated) {
    notif.refreshUnread()
  }
}

useSocket(
  {
    new_notification: onNewNotification,
    connect: onReconnect,
  },
  { autoConnect: false },
)

onMounted(async () => {
  if (!auth.initialized) {
    await auth.fetchMe()
  }
  if (auth.isAuthenticated) {
    notif.refreshUnread()
    connectSocket()
  }
})

watch(
  () => auth.isAuthenticated,
  (value) => {
    if (value) {
      notif.refreshUnread()
      connectSocket()
    } else {
      notif.reset()
      disconnectSocket()
    }
  },
)

// Har sahifa o'zgarishida bildirishnomalarni yangilash (qo'shimcha mustahkamlik)
watch(
  () => route.fullPath,
  () => {
    if (auth.isAuthenticated) {
      notif.refreshUnread()
    }
  },
)
</script>

<template>
  <div class="app">
    <template v-if="layout === 'auth'">
      <AuthLayout>
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </AuthLayout>
    </template>

    <template v-else>
      <AppNavbar />
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
      <AppFooter />
    </template>

    <ToastContainer />
    <ConfirmDialog />
  </div>
</template>

<style>
.app {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.app > main {
  flex: 1;
}
</style>
