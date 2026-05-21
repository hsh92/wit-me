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
  getUserApplicationForStudy,
  getStudyApplicationStats,
  getUserProfile,
} from '@/lib/study-repo'
import {
  getApplicationStatusLabel,
  getApplicationStatusMessage,
  getApplicationStatusStyles,
} from '@/lib/application-status'
import { Application, Study, User } from '@/types/domain'
import { getFirestoreErrorMessage } from '@/lib/auth-errors'

export default function StudyDetail() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.id as string
  const { firebaseUser, user, loading } = useAuth()

  const [study, setStudy] = useState<Study | null>(null)
  const [leaderInfo, setLeaderInfo] = useState<User | null>(null)
  const [myApplication, setMyApplication] = useState<Application | null>(null)
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [message, setMessage] = useState('')
  const [studyLoading, setStudyLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setError('')
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

      const stats = await getStudyApplicationStats(db, studyId)
      setApprovedCount(stats.approved)
      setPendingCount(stats.pending)

      if (firebaseUser) {
        const application = await getUserApplicationForStudy(
          db,
          studyId,
          firebaseUser.uid
        )
        setMyApplication(application)
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

    if (myApplication) {
      setError('이미 신청한 스터디입니다.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const { db } = getFirebaseServices()
      await createApplication(db, studyId, firebaseUser.uid, message)

      setSuccess('참여 신청이 접수되었습니다. 모임장 승인 후 참가자 수에 반영됩니다.')
      setMessage('')

      await loadStudy()
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
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

  const canApply =
    !myApplication && user?.role !== 'leader' && user?.uid !== study.leaderUid

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-6 border-b border-gray-200">
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
              <p className="text-sm text-gray-600 mb-1">✅ 승인된 참가자</p>
              <p className="font-semibold text-green-700">
                {approvedCount}명
              </p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
            <p>
              <strong>신청 대기:</strong> {pendingCount}명 ·{' '}
              <strong>승인된 참가자:</strong> {approvedCount}/
              {study.maxParticipants}명
            </p>
            <p className="mt-1 text-gray-500">
              참여 신청 직후에는 승인 대기 상태이며, 모임장이 승인하면 참가자
              수에 반영됩니다.
            </p>
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

          {myApplication && (
            <div
              className={`mb-6 p-4 border rounded-lg ${getApplicationStatusStyles(myApplication.status)}`}
              role="status"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-bold text-lg">내 신청 현황</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/60">
                  {getApplicationStatusLabel(myApplication.status)}
                </span>
              </div>
              <p className="text-sm mb-2">
                {getApplicationStatusMessage(myApplication.status, study.title)}
              </p>
              <p className="text-xs opacity-80">
                신청일:{' '}
                {myApplication.appliedAt.toLocaleString('ko-KR')}
                {myApplication.respondedAt &&
                  ` · 처리일: ${myApplication.respondedAt.toLocaleString('ko-KR')}`}
              </p>
              {myApplication.message && (
                <p className="mt-3 text-sm bg-white/50 rounded p-2">
                  <strong>신청 메시지:</strong> {myApplication.message}
                </p>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}

          {error && !studyLoading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {canApply ? (
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {submitting ? '신청 중...' : '스터디 참여 신청'}
              </button>
            </form>
          ) : user?.role === 'leader' ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              모임장은 다른 스터디에 신청할 수 없습니다. 본인 스터디는{' '}
              <Link href="/leader/studies" className="text-indigo-600 underline">
                내 스터디
              </Link>
              에서 관리하세요.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
