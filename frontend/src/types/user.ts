export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department: string
  station: string
}

export type UserRole = 'Admin' | 'Analyst' | 'Officer' | 'Supervisor'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}
