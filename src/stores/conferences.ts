import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  Conference,
  ConferenceStatus,
  CreateConferenceInput,
  UpdateConferenceInput,
} from '@/types'
import { conferencesApi } from '@/services/conferences'

export const useConferencesStore = defineStore('conferences', () => {
  const items = ref<Conference[]>([])
  const current = ref<Conference | null>(null)
  const loading = ref(false)
  const loadingDetail = ref(false)
  const filters = ref<{ status?: ConferenceStatus; search?: string }>({})

  const ordered = computed(() =>
    [...items.value].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    ),
  )

  const fetchAll = async (
    params: { status?: ConferenceStatus; search?: string } = {},
  ) => {
    loading.value = true
    filters.value = params
    try {
      items.value = await conferencesApi.list(params)
      return items.value
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (id: string) => {
    loadingDetail.value = true
    try {
      current.value = await conferencesApi.byId(id)
      return current.value
    } finally {
      loadingDetail.value = false
    }
  }

  const create = async (payload: CreateConferenceInput) => {
    const created = await conferencesApi.create(payload)
    items.value = [created, ...items.value]
    return created
  }

  const update = async (id: string, payload: UpdateConferenceInput) => {
    const updated = await conferencesApi.update(id, payload)
    items.value = items.value.map((c) => (c.id === id ? updated : c))
    if (current.value?.id === id) current.value = updated
    return updated
  }

  const remove = async (id: string) => {
    await conferencesApi.remove(id)
    items.value = items.value.filter((c) => c.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return {
    items,
    ordered,
    current,
    loading,
    loadingDetail,
    filters,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
  }
})
