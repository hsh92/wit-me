'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getFirebaseServices } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'
import {
  getStudy,
  createApplication,
  checkDuplicateApplication,
  getUserProfile,
} from '@/lib/study-repo'
import { Study, User } from '@/types/domain'

export default function StudyDetail() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.id as string
  const { firebaseUser, user, loading } = useAuth()

  const [study, setStudy] = useState<Study | null>(null)
  const [leaderInfo, setLeaderInfo] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [studyLoading, setStudyLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login')
    }
  }, [loading, firebaseUser, router])

  useEffect(() => {
    if (firebaseUser && studyId) {
      loadStudy()
    }
  }, [firebaseUser, studyId])

  const loadStudy = async () => {
    try {
      setStudyLoading(true)
      const { db } = getFirebaseServices()
      const studyData = await getStudy(db, studyId)

      if (!studyData) {
        setError('스터디를 찾을 수 없습니다.')
        return
      }

      setStudy(studyData)

      const leaderProfile = await getUserProfile(db, studyData.leaderUid)
      if (leaderProfile) {
        setLeaderInfo(leaderProfile)
      }

      if (firebaseUser) {
        const isDuplicate = await checkDuplicateApplication(
          db,
          studyId,
          firebaseUser.uid
        )
        setAlreadyApplied(isDuplicate)
      }
    } catch (err) {
      setError('스터디 정보를 불러오는 데 실패했습니다.')
      console.error(err)
    } finally {
      setStudyLoading(false)
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firebaseUser) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!message.trim()) {
      setError('신청 메시지를 입력해주세요.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const { db } = getFirebaseServices()

      const isDuplicate = await checkDuplicateApplication(
        db,
        studyId,
        firebaseUser.uid
      )

      if (isDuplicate) {
        setError('이미 신청한 스터디입니다.')
        setSubmitting(false)
        return
      }

      await createApplication(db, studyId, firebaseUser.uid, message)
      setSuccess('스터디 신청이 완료되었습니다!')
      setMessage('')
      setAlreadyApplied(true)

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError('신청 중에 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { auth } = getFirebaseServices()
      await logout(auth)
      router.push('/login')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!firebaseUser) {
    return null
  }

  if (studyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">스터디 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!study || error === '스터디를 찾을 수 없습니다.') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Wit.me
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              로그아웃
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">스터디를 찾을 수 없습니다.</p>
          <Link href="/" className="text-indigo-600 hover:underline font-semibold">
            돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Wit.me
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.displayName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-indigo-600 hover:underline font-semibold mb-6 inline-block"
        >
          ← 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-3">
              {study.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {study.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">📍 위치</p>
              <p className="font-semibold text-gray-900">{study.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">📅 일시</p>
              <p className="font-semibold text-gray-900">
                {study.scheduledDate.toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">👥 정원</p>
              <p className="font-semibold text-gray-900">
                {study.maxParticipants}명
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">📊 참가자</p>
              <p className="font-semibold text-gray-900">
                {study.currentParticipants}명
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {study.description}
            </p>
          </div>

          {leaderInfo && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">모임장</h3>
              <p className="text-gray-700">{leaderInfo.displayName}</p>
            </div>
          )}

          {alreadyApplied ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              ✓ 이미 이 스터디에 신청했습니다.
            </div>
          ) : user?.role === 'leader' ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              모임장은 스터디에 신청할 수 없습니다.
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청 메시지
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="이 스터디에 참여하고 싶은 이유를 작성해주세요."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition resize-none"
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {submitting ? '신청 중...' : '스터디 신청'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
