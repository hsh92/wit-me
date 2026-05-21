import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth'
import { getFirebaseErrorMessage } from '@/lib/auth-errors'

export { getFirebaseErrorMessage } from '@/lib/auth-errors'

export const signUp = async (auth: Auth, email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null as string | null }
  } catch (error) {
    return { user: null, error: getFirebaseErrorMessage(error) }
  }
}

export const signIn = async (auth: Auth, email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null as string | null }
  } catch (error) {
    return { user: null, error: getFirebaseErrorMessage(error) }
  }
}

export const logout = async (auth: Auth) => {
  try {
    await signOut(auth)
    return { error: null as string | null }
  } catch (error) {
    return { error: getFirebaseErrorMessage(error) }
  }
}

export const subscribeToAuthChanges = (
  auth: Auth,
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback)
}
