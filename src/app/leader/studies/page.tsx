'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFirebaseServices } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'
import { getLeaderStudies } from '@/lib/study-repo'
import { Study } from '@/types/domain'

export default function LeaderStudies() {
  const router = useRouter()
  const { firebaseUser, user, loading } = useAuth()
  const [studies, setStudies] = useState<Study[]>([])
  const [studiesLoading, setStudiesLoading] = useState(true)
  const [error, setError] = useState('')

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
      loadStudies()
    }
  }, [firebaseUser])

  const loadStudies = async () => {
    try {
      setStudiesLoading(true)
      const { db } = getFirebaseServices()
      const data = await getLeaderStudies(db, firebaseUser!.uid)
      setStudies(data)
    } catch (err) {
      setError('스터디를 불러오는 데 실패했습니다.')
      console.error(err)
    } finally {
      setStudiesLoading(false)
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

  if (!firebaseUser || user?.role !== 'leader') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Wit.me
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.displayName}</span>
            <Link
              href="/leader/studies/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
            >
              새 스터디 생성
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-indigo-600 hover:underline font-semibold mb-6 inline-block"
        >
          ← 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 스터디</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {studiesLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">스터디를 불러오는 중...</div>
          </div>
        ) : studies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-500 mb-4">생성한 스터디가 없습니다.</div>
            <Link
              href="/leader/studies/new"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              새 스터디 생성하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold mb-2">
                    {study.category}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                    {study.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {study.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📍</span>
                    <span className="line-clamp-1">{study.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">👥</span>
                    <span>
                      {study.currentParticipants}/{study.maxParticipants}명
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/leader/studies/${study.id}/applicants`}
                    className="w-full block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm text-center"
                  >
                    신청자 관리
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
