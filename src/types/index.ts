export type UserRole =
  | 'ADMIN'
  | 'ORGANIZER'
  | 'SPEAKER'
  | 'PARTICIPANT'
  | 'GUEST'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string | null
  bio?: string | null
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export type ConferenceStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ONGOING'
  | 'FINISHED'
  | 'CANCELLED'

export interface Conference {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isOnline: boolean
  organizerId: string
  organizer?: User
  status: ConferenceStatus
  bannerUrl?: string | null
  participantsCount?: number
  createdAt?: string
}

export interface Session {
  id: string
  conferenceId: string
  title: string
  description: string
  startTime: string
  endTime: string
  room?: string | null
  virtualLink?: string | null
  speakerId?: string | null
  speaker?: User | null
}

export type RegistrationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'ATTENDED'

export interface Registration {
  id: string
  userId: string
  conferenceId: string
  status: RegistrationStatus
  ticketCode: string
  createdAt: string
}

export interface Question {
  id: string
  sessionId: string
  userId: string
  user?: User
  text: string
  upvotes: number
  isAnswered: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface Material {
  id: string
  sessionId: string
  fileUrl: string
  fileType: string
  fileName: string
}

export interface Certificate {
  id: string
  userId: string
  conferenceId: string
  code: string
  issuedAt: string
}

export interface Feedback {
  id: string
  sessionId: string
  userId: string
  rating: number
  comment?: string | null
  createdAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type BadgeTone = 'brand' | 'info' | 'warn' | 'error' | 'neutral'
