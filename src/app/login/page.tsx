'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getFirebaseServices } from '@/lib/firebase'
import { signUp, signIn } from '@/lib/auth'
import { getFirestoreErrorMessage } from '@/lib/auth-errors'
import { createUserProfile } from '@/lib/study-repo'
import { isValidEmail, isValidPassword } from '@/lib/validation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'user' | 'leader'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 입력값 검증
      if (!email.trim()) {
        setError('이메일을 입력해주세요.')
        setLoading(false)
        return
      }

      if (!password.trim()) {
        setError('비밀번호를 입력해주세요.')
        setLoading(false)
        return
      }

      if (!isValidEmail(email)) {
        setError('유효한 이메일 형식을 입력해주세요.')
        setLoading(false)
        return
      }

      if (!isValidPassword(password)) {
        setError('비밀번호는 6자 이상이어야 합니다.')
        setLoading(false)
        return
      }

      if (isSignUp && !displayName.trim()) {
        setError('이름을 입력해주세요.')
        setLoading(false)
        return
      }

      const { auth, db } = getFirebaseServices()

      if (isSignUp) {
        const { user, error: signUpError } = await signUp(auth, email, password)
        if (signUpError) {
          setError(signUpError)
          setLoading(false)
          return
        }

        if (!user) {
          setError('회원가입 중 오류가 발생했습니다.')
          setLoading(false)
          return
        }

        try {
          await createUserProfile(db, user.uid, email, displayName, role)
        } catch (profileError) {
          setError(getFirestoreErrorMessage(profileError))
          setLoading(false)
          return
        }
      } else {
        const { user, error: signInError } = await signIn(auth, email, password)
        if (signInError) {
          setError(signInError)
          setLoading(false)
          return
        }

        if (!user) {
          setError('로그인 중 오류가 발생했습니다.')
          setLoading(false)
          return
        }
      }

      router.push('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('예상치 못한 오류가 발생했습니다.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Wit.me
        </h1>
        <p className="text-center text-gray-600 mb-8">
          스터디 모임 매칭 플랫폼
        </p>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => {
              setIsSignUp(false)
              setError('')
            }}
            className={`flex-1 py-2 rounded font-semibold transition ${
              !isSignUp
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setIsSignUp(true)
              setError('')
            }}
            className={`flex-1 py-2 rounded font-semibold transition ${
              isSignUp
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  aria-label="역할 선택"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as 'user' | 'leader')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                >
                  <option value="user">일반 사용자 (스터디 검색·참여)</option>
                  <option value="leader">모임장 (스터디 생성·신청 관리)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  스터디를 직접 만들려면 <strong>모임장</strong>을 선택하세요.
                  가입 후에는 역할을 바꿀 수 없습니다.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading
              ? '진행 중...'
              : isSignUp
                ? '회원가입'
                : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
