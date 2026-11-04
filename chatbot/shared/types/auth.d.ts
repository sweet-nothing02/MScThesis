// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email?: string | null
    avatar?: string | null
    username: string
    provider: 'github' | 'neptun' | 'instructor'
    providerId: string
    role: 'student' | 'instructor'
    neptunCode?: string | null
    consentGiven?: boolean
    consentGivenAt?: string | Date | null
    createdAt?: Date
  }

  interface UserSession {
    user?: User
  }
}

export {}
