import api from './api'
import type { CreateQuestionInput, Question } from '@/types'

export const questionsApi = {
  bySession: (sessionId: string) =>
    api.get<Question[]>(`/questions/session/${sessionId}`).then((r) => r.data),

  create: (payload: CreateQuestionInput) =>
    api.post<Question>('/questions', payload).then((r) => r.data),

  upvote: (id: string) =>
    api.post<Question>(`/questions/${id}/upvote`).then((r) => r.data),

  answer: (id: string, answer: string) =>
    api.post<Question>(`/questions/${id}/answer`, { answer }).then((r) => r.data),
}
