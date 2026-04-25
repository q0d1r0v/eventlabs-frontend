// Backend bilan to'liq mos keladigan tiplar — Prisma schema asosida

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
  isVerified?: boolean
  createdAt: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshResponse {
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
  bannerUrl?: string | null
  logoUrl?: string | null
  category?: string | null
  status: ConferenceStatus
  maxAttendees?: number | null
  organizerId: string
  organizer?: User
  sessions?: Session[]
  _count?: {
    sessions?: number
    registrations?: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateConferenceInput {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isOnline?: boolean
  category?: string
  maxAttendees?: number
}

export interface UpdateConferenceInput extends Partial<CreateConferenceInput> {
  status?: ConferenceStatus
}

export interface Session {
  id: string
  conferenceId: string
  conference?: Conference
  title: string
  description: string
  startTime: string
  endTime: string
  room?: string | null
  virtualLink?: string | null
  speakerId?: string | null
  speaker?: User | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateSessionInput {
  conferenceId: string
  title: string
  description: string
  startTime: string
  endTime: string
  room?: string | null
  virtualLink?: string | null
  speakerId?: string | null
}

export interface UpdateSessionInput extends Partial<CreateSessionInput> {}

export type RegistrationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'ATTENDED'

export interface Registration {
  id: string
  userId: string
  user?: User
  conferenceId: string
  conference?: Conference
  status: RegistrationStatus
  ticketCode: string
  createdAt: string
}

export interface Question {
  id: string
  sessionId: string
  userId: string
  user?: Pick<User, 'id' | 'name' | 'avatar'>
  text: string
  upvotes: number
  isAnswered: boolean
  answer?: string | null
  createdAt: string
}

export interface CreateQuestionInput {
  sessionId: string
  text: string
}

export type NotificationType =
  | 'SYSTEM'
  | 'CONFERENCE'
  | 'SESSION'
  | 'QUESTION'
  | 'CERTIFICATE'

export interface Notification {
  id: string
  userId: string
  type: NotificationType | string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export interface Material {
  id: string
  sessionId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  createdAt?: string
}

export interface Certificate {
  id: string
  userId: string
  user?: User
  conferenceId: string
  conference?: Conference
  code: string
  pdfUrl?: string | null
  issuedAt: string
}

export interface CertificateVerification {
  valid: boolean
  certificate?: Certificate
}

export interface Feedback {
  id: string
  sessionId: string
  userId: string
  user?: Pick<User, 'id' | 'name' | 'avatar'>
  rating: number
  comment?: string | null
  createdAt: string
}

export interface CreateFeedbackInput {
  sessionId: string
  rating: number
  comment?: string
}

export interface FeedbackAverage {
  average: number
  count: number
}

export interface UnreadCountResponse {
  count: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

// Socket event payloads
export interface SocketUserJoinedPayload {
  userId: string
  socketId: string
}

export interface SocketMessagePayload {
  userId: string
  text: string
  timestamp: string
}

// UI primitives
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type BadgeTone = 'brand' | 'info' | 'warn' | 'error' | 'neutral'
export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  tone: ToastTone
  title?: string
  message: string
  duration?: number
}
