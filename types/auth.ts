export interface Account {
  id: string
  email: string
  password: string // PHC-style hash
  lastLogin: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  account?: {
    id: string
    email: string
    lastLogin: string | null
  }
}

export interface Session {
  accountId: string
  email: string
  expiresAt: string
}
