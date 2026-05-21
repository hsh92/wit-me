export type UserRole = 'user' | 'leader'

export interface User {
  uid: string
  email: string
  displayName?: string
  role: UserRole
  createdAt: Date
}

export interface Study {
  id: string
  title: string
  description: string
  category: string
  scheduledDate: Date
  location: string
  maxParticipants: number
  currentParticipants: number
  leaderUid: string
  status: 'open' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  studyId: string
  userId: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: Date
  respondedAt?: Date
}

export interface Participant {
  userId: string
  email: string
  displayName: string
  status: 'approved'
}
