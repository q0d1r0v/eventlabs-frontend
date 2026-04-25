import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Registration } from '@/types'
import { registrationsApi } from '@/services/registrations'

export const useRegistrationsStore = defineStore('registrations', () => {
  const mine = ref<Registration[]>([])
  const loading = ref(false)

  const activeRegistrations = computed(() =>
    mine.value.filter((r) => r.status !== 'CANCELLED'),
  )

  const conferenceIds = computed(
    () => new Set(activeRegistrations.value.map((r) => r.conferenceId)),
  )

  const isRegistered = (conferenceId: string) =>
    conferenceIds.value.has(conferenceId)

  const fetchMine = async () => {
    loading.value = true
    try {
      mine.value = await registrationsApi.mine()
      return mine.value
    } finally {
      loading.value = false
    }
  }

  const register = async (conferenceId: string) => {
    const reg = await registrationsApi.register(conferenceId)
    mine.value = [reg, ...mine.value.filter((r) => r.conferenceId !== conferenceId)]
    return reg
  }

  const cancel = async (conferenceId: string) => {
    await registrationsApi.cancel(conferenceId)
    mine.value = mine.value.filter((r) => r.conferenceId !== conferenceId)
  }

  const reset = () => {
    mine.value = []
  }

  return {
    mine,
    loading,
    conferenceIds,
    isRegistered,
    fetchMine,
    register,
    cancel,
    reset,
  }
})
