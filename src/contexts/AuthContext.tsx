'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { subscribeToAuthChanges } from '@/lib/auth'
import { getFirebaseServices } from '@/lib/firebase'
import { User } from '@/types/domain'
import { getUserProfile } from '@/lib/study-repo'

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  firebaseError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const { auth, db } = getFirebaseServices()

      unsubscribe = subscribeToAuthChanges(auth, async (fbUser) => {
        setFirebaseUser(fbUser)

        if (fbUser) {
          try {
            const userProfile = await getUserProfile(db, fbUser.uid)
            setUser(userProfile)
          } catch (err) {
            console.error('프로필 로드 실패:', err)
            setUser(null)
          }
        } else {
          setUser(null)
        }

        setLoading(false)
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Firebase 초기화에 실패했습니다.'
      setFirebaseError(message)
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [])

  if (firebaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <h1 className="text-xl font-bold text-red-700 mb-4">
            Firebase 설정 오류
          </h1>
          <p className="text-gray-700 text-sm whitespace-pre-line mb-6">
            {firebaseError}
          </p>
          <div className="bg-gray-50 rounded p-4 text-xs text-gray-600">
            <p className="font-semibold mb-2">.env.local 파일에 다음을 추가하세요:</p>
            <pre className="whitespace-pre-wrap break-all">
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, firebaseError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
