'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFirebaseServices } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'
import { createStudy, getLeaderStudies } from '@/lib/study-repo'
import { canCreateMoreStudies, MAX_LEADER_STUDIES } from '@/lib/validation'

export default function CreateStudy() {
  const router = useRouter()
  const { firebaseUser, user, loading } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('프로그래밍')
  const [location, setLocation] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('10')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [studyCount, setStudyCount] = useState(0)
  const [summarizing, setSummarizing] = useState(false)
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null)
  const [summaryNotice, setSummaryNotice] = useState('')

  const categories = ['프로그래밍', '언어', '자격증', '기타']

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login')
    }
  }, [loading, firebaseUser, router])

  useEffect(() => {
    if (!loading && user?.role !== 'leader') {
      router.push('/')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (firebaseUser) {
      checkStudyLimit()
    }
  }, [firebaseUser])

  const checkStudyLimit = async () => {
    try {
      const { db } = getFirebaseServices()
      const studies = await getLeaderStudies(db, firebaseUser!.uid)
      setStudyCount(studies.length)
    } catch (err) {
      console.error('스터디 개수 확인 오류:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!description.trim()) {
      setError('설명을 입력해주세요.')
      return
    }

    if (!location.trim()) {
      setError('위치를 입력해주세요.')
      return
    }

    if (!scheduledDate) {
      setError('일시를 선택해주세요.')
      return
    }

    if (!canCreateMoreStudies(studyCount)) {
      setError(`최대 ${MAX_LEADER_STUDIES}개의 스터디만 생성할 수 있습니다.`)
      return
    }

    setSubmitting(true)

    try {
      const { db } = getFirebaseServices()

      const studies = await getLeaderStudies(db, firebaseUser!.uid)
      if (!canCreateMoreStudies(studies.length)) {
        setError(`최대 ${MAX_LEADER_STUDIES}개의 스터디만 생성할 수 있습니다.`)
        setSubmitting(false)
        return
      }

      const participants = parseInt(maxParticipants, 10)
      if (Number.isNaN(participants) || participants < 1) {
        setError('최대 참가자 수는 1명 이상이어야 합니다.')
        setSubmitting(false)
        return
      }

      await createStudy(db, {
        title,
        description,
        category,
        location,
        scheduledDate: new Date(scheduledDate),
        maxParticipants: participants,
        leaderUid: firebaseUser!.uid,
        status: 'open',
      })

      router.push('/leader/studies')
    } catch (err) {
      setError('스터디 생성 중에 오류가 발생했습니다.')
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

  const handleSummarize = async () => {
    if (!description.trim()) {
      setError('설명을 먼저 입력해주세요.')
      return
    }

    setSummarizing(true)
    setError('')
    setSummaryNotice('')
    setSuggestedSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      let data: { summary?: string; error?: string; fallback?: boolean } = {}
      try {
        data = await response.json()
      } catch {
        setError('서버 응답을 읽을 수 없습니다.')
        return
      }

      if (!response.ok) {
        setError(data.error || '설명 요약에 실패했습니다.')
        return
      }

      const summary =
        typeof data.summary === 'string' ? data.summary.trim() : ''

      if (!summary) {
        setError('요약 결과가 비어 있습니다. 다시 시도해주세요.')
        return
      }

      setSuggestedSummary(summary)
      setSummaryNotice('AI 요약이 완료되었습니다. 아래 결과를 확인한 뒤 설명에 적용하세요.')
    } catch (err) {
      setError('설명 요약 중 네트워크 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setSummarizing(false)
    }
  }

  const handleApplySummary = () => {
    if (!suggestedSummary) return
    setDescription(suggestedSummary)
    setSummaryNotice('요약 내용을 설명란에 적용했습니다.')
    setSuggestedSummary(null)
  }

  const handleDismissSummary = () => {
    setSuggestedSummary(null)
    setSummaryNotice('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!firebaseUser || user?.role !== 'leader') {
    return null
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
            <Link
              href="/leader/studies"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
            >
              내 스터디
            </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 스터디 생성
          </h1>
          <p className="text-gray-600 mb-8">
            {studyCount}/5개 스터디 생성
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="스터디 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 *
              </label>
              <div className="flex gap-2 mb-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="스터디에 대해 설명해주세요"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition resize-none"
                  rows={5}
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={summarizing || !description.trim()}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition font-semibold"
                >
                  {summarizing ? '요약 생성 중...' : '✨ AI로 요약하기'}
                </button>
                {summarizing && (
                  <span className="text-sm text-gray-500">
                    약 5~15초 소요될 수 있습니다.
                  </span>
                )}
              </div>

              {error && (
                <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {summaryNotice && !suggestedSummary && (
                <p className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {summaryNotice}
                </p>
              )}

              {suggestedSummary && (
                <div
                  className="mt-3 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    AI 요약 결과
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">
                    {suggestedSummary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleApplySummary}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                    >
                      설명에 적용
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissSummary}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  aria-label="스터디 카테고리"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 참가자 수 *
                </label>
                <input
                  aria-label="최대 참가자 수"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="스터디 장소를 입력하세요 (예: 강남역 카페)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일시 *
              </label>
              <input
                aria-label="스터디 일시"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !canCreateMoreStudies(studyCount)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {submitting ? '생성 중...' : '스터디 생성'}
              </button>
              <Link
                href="/"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
