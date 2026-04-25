import api from './api'
import type { CreateFeedbackInput, Feedback, FeedbackAverage } from '@/types'

export const feedbackApi = {
  bySession: (sessionId: string) =>
    api.get<Feedback[]>(`/feedback/session/${sessionId}`).then((r) => r.data),

  average: (sessionId: string) =>
    api
      .get<FeedbackAverage>(`/feedback/session/${sessionId}/average`)
      .then((r) => r.data),

  create: (payload: CreateFeedbackInput) =>
    api.post<Feedback>('/feedback', payload).then((r) => r.data),
}
