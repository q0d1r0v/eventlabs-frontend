<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useSocket } from '@/composables/useSocket'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useUpvotes } from '@/composables/useUpvotes'
import { questionsApi } from '@/services/questions'
import { extractApiError } from '@/services/api'
import { formatRelativeTime } from '@/composables/useFormatters'
import type { Question } from '@/types'

const props = defineProps<{
  sessionId: string
  conferenceId?: string
}>()

const auth = useAuthStore()
const toast = useToast()

const items = ref<Question[]>([])
const text = ref('')
const sending = ref(false)
const loading = ref(false)
const answer = ref<Record<string, string>>({})

const upvotes = useUpvotes(() => props.sessionId)

const fetchInitial = async () => {
  loading.value = true
  try {
    items.value = await questionsApi.bySession(props.sessionId)
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loading.value = false
  }
}

const onNewQuestion = (q: Question) => {
  if (q.sessionId !== props.sessionId) return
  if (items.value.some((existing) => existing.id === q.id)) return
  items.value = [q, ...items.value]
}

const onUpvoted = (q: Question) => {
  if (q.sessionId !== props.sessionId) return
  items.value = items.value.map((existing) =>
    existing.id === q.id ? q : existing,
  )
}

const { connected, emit } = useSocket(
  {
    new_question: onNewQuestion,
    question_upvoted: onUpvoted,
    question_answered: onUpvoted,
  },
  { autoConnect: true },
)

const joinedSession = ref<string | null>(null)
const joinedConference = ref<string | null>(null)

const joinRoom = () => {
  if (!connected.value) return

  if (joinedSession.value && joinedSession.value !== props.sessionId) {
    emit('leave_session', { sessionId: joinedSession.value })
  }
  emit('join_session', { sessionId: props.sessionId })
  joinedSession.value = props.sessionId

  if (props.conferenceId && joinedConference.value !== props.conferenceId) {
    if (joinedConference.value) {
      emit('leave_conference', { conferenceId: joinedConference.value })
    }
    emit('join_conference', { conferenceId: props.conferenceId })
    joinedConference.value = props.conferenceId
  }
}

watch(
  [connected, () => props.sessionId, () => props.conferenceId],
  ([isConnected, sessionId]) => {
    if (isConnected && sessionId) {
      joinRoom()
    }
  },
  { immediate: true },
)

watch(() => props.sessionId, fetchInitial, { immediate: true })

onBeforeUnmount(() => {
  if (joinedSession.value) {
    emit('leave_session', { sessionId: joinedSession.value })
  }
  if (joinedConference.value) {
    emit('leave_conference', { conferenceId: joinedConference.value })
  }
})

const sorted = computed(() =>
  [...items.value].sort((a, b) => {
    if (a.isAnswered !== b.isAnswered) {
      return a.isAnswered ? 1 : -1
    }
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }),
)

const onSubmit = async (e: Event) => {
  e.preventDefault()
  if (!auth.isAuthenticated) {
    toast.warning('Savol berish uchun tizimga kiring')
    return
  }
  const trimmed = text.value.trim()
  if (trimmed.length < 3) {
    toast.warning("Savol kamida 3 ta belgi bo'lishi kerak")
    return
  }
  sending.value = true
  try {
    if (connected.value) {
      emit('send_question', { sessionId: props.sessionId, text: trimmed })
    } else {
      const q = await questionsApi.create({
        sessionId: props.sessionId,
        text: trimmed,
      })
      onNewQuestion(q)
    }
    text.value = ''
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    sending.value = false
  }
}

const onUpvote = (id: string) => {
  if (!auth.isAuthenticated) {
    toast.warning("Yoqtirish uchun tizimga kiring")
    return
  }
  if (upvotes.has(id)) {
    toast.info("Siz bu savolni allaqachon yoqtirgansiz")
    return
  }
  if (!upvotes.mark(id)) return

  if (connected.value) {
    emit('upvote_question', { questionId: id, sessionId: props.sessionId })
  } else {
    questionsApi.upvote(id).then(onUpvoted).catch((err) => {
      toast.error(extractApiError(err))
    })
  }
}

const canAnswer = computed(() =>
  Boolean(auth.isOrganizer || auth.user?.role === 'SPEAKER'),
)

const onAnswer = async (id: string) => {
  const value = answer.value[id]?.trim()
  if (!value) return
  try {
    const updated = await questionsApi.answer(id, value)
    items.value = items.value.map((q) => (q.id === id ? updated : q))
    answer.value[id] = ''
    toast.success('Javob saqlandi')
  } catch (err) {
    toast.error(extractApiError(err))
  }
}
</script>

<template>
  <section class="qa">
    <header class="qa__head">
      <div>
        <h3 class="qa__title">Savol-javob</h3>
        <p class="qa__sub">
          Savolingizni yozing — boshqa qatnashchilar uni yoqtirsa yuqoriga
          ko'tariladi.
        </p>
      </div>
      <span class="qa__live" :class="{ 'qa__live--on': connected }">
        <span class="qa__dot" aria-hidden="true" />
        {{ connected ? 'Jonli' : 'Ulanmoqda...' }}
      </span>
    </header>

    <form class="qa__form" @submit="onSubmit">
      <textarea
        v-model="text"
        class="qa__input"
        :placeholder="
          auth.isAuthenticated
            ? 'Savolingizni yozing...'
            : 'Savol berish uchun tizimga kiring'
        "
        rows="2"
        maxlength="500"
        :disabled="!auth.isAuthenticated || sending"
      />
      <div class="qa__form-foot">
        <span class="qa__counter">{{ text.length }} / 500</span>
        <BaseButton
          type="submit"
          variant="primary"
          size="sm"
          :disabled="!auth.isAuthenticated || sending || text.trim().length < 3"
        >
          {{ sending ? 'Yuborilmoqda...' : 'Savol yuborish' }}
        </BaseButton>
      </div>
    </form>

    <p v-if="loading" class="qa__state">Yuklanmoqda...</p>
    <p v-else-if="sorted.length === 0" class="qa__state">
      Hali savol yo'q. Birinchi bo'lib so'rang.
    </p>

    <ul v-else class="qa__list">
      <li
        v-for="q in sorted"
        :key="q.id"
        class="qa__item"
        :class="{ 'qa__item--answered': q.isAnswered }"
      >
        <button
          type="button"
          class="qa__upvote"
          :class="{ 'qa__upvote--voted': upvotes.has(q.id) }"
          :aria-label="`Yoqdi: ${q.upvotes}`"
          :aria-pressed="upvotes.has(q.id)"
          :disabled="upvotes.has(q.id)"
          @click="onUpvote(q.id)"
        >
          <IconBase :size="14">
            <polyline points="6 15 12 9 18 15" />
          </IconBase>
          <span>{{ q.upvotes }}</span>
        </button>

        <div class="qa__body">
          <header class="qa__meta">
            <strong class="qa__author">{{ q.user?.name ?? 'Qatnashchi' }}</strong>
            <span class="qa__time">{{ formatRelativeTime(q.createdAt) }}</span>
            <span v-if="q.isAnswered" class="qa__chip">Javob berildi</span>
          </header>
          <p class="qa__text">{{ q.text }}</p>

          <div v-if="q.isAnswered && q.answer" class="qa__answer">
            <span class="qa__answer-label">Javob</span>
            <p>{{ q.answer }}</p>
          </div>

          <form
            v-if="canAnswer && !q.isAnswered"
            class="qa__answer-form"
            @submit.prevent="onAnswer(q.id)"
          >
            <input
              v-model="answer[q.id]"
              type="text"
              class="qa__answer-input"
              placeholder="Javob yozing..."
              maxlength="1000"
            />
            <BaseButton type="submit" variant="accent" size="sm">
              Javob berish
            </BaseButton>
          </form>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.qa {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qa__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.qa__title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.qa__sub {
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.qa__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: var(--color-bg-muted);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.qa__live--on {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.qa__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-text-muted);
}

.qa__live--on .qa__dot {
  background: var(--color-brand);
  animation: pulse-qa 1.6s ease-in-out infinite;
}

@keyframes pulse-qa {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(24, 226, 153, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 226, 153, 0);
  }
}

.qa__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa__input {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 14px;
  padding: 12px 14px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  resize: vertical;
  outline: none;
  color: var(--color-text);
  transition:
    border-color 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
}

.qa__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.qa__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qa__form-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qa__counter {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
}

.qa__state {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.qa__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa__item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  align-items: flex-start;
}

.qa__item--answered {
  background: rgba(212, 250, 232, 0.3);
  border-color: rgba(15, 167, 110, 0.2);
}

.qa__upvote {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 8px 4px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition:
    background 0.2s var(--ease-out-soft),
    border-color 0.2s var(--ease-out-soft);
}

.qa__upvote:hover:not(:disabled) {
  background: var(--color-brand-light);
  border-color: var(--color-brand);
  color: var(--color-brand-deep);
}

.qa__upvote--voted,
.qa__upvote:disabled {
  background: var(--color-brand-light);
  border-color: var(--color-brand);
  color: var(--color-brand-deep);
  cursor: default;
}

.qa__body {
  min-width: 0;
}

.qa__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.qa__author {
  font-size: 14px;
  color: var(--color-text);
}

.qa__time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.4px;
}

.qa__chip {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  border-radius: 9999px;
  padding: 2px 8px;
}

.qa__text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.qa__answer {
  margin-top: 12px;
  padding: 12px 14px;
  background: var(--color-bg);
  border-left: 2px solid var(--color-brand);
  border-radius: var(--radius-md);
}

.qa__answer-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  margin-bottom: 4px;
}

.qa__answer p {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.qa__answer-form {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.qa__answer-input {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 14px;
  padding: 8px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  outline: none;
}

.qa__answer-input:focus {
  border-color: var(--color-brand);
}
</style>
