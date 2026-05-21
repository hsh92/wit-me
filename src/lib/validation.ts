export const MAX_LEADER_STUDIES = 5

export function canCreateMoreStudies(currentCount: number): boolean {
  return currentCount < MAX_LEADER_STUDIES
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}
