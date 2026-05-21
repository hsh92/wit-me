'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFirebaseServices } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'
import { getAllStudies } from '@/lib/study-repo'
import { Study } from '@/types/domain'

export default function Home() {
  const router = useRouter()
  const { firebaseUser, user, loading } = useAuth()
  const [studies, setStudies] = useState<Study[]>([])
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [studiesLoading, setStudiesLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = ['all', '프로그래밍', '언어', '자격증', '기타']

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login')
    }
  }, [loading, firebaseUser, router])

  useEffect(() => {
    if (firebaseUser) {
      loadStudies()
    }
  }, [firebaseUser])

  useEffect(() => {
    filterStudies()
  }, [studies, searchQuery, selectedCategory])

  const loadStudies = async () => {
    try {
      setStudiesLoading(true)
      const { db } = getFirebaseServices()
      const data = await getAllStudies(db)
      setStudies(data)
    } catch (err) {
      setError('스터디를 불러오는 데 실패했습니다.')
      console.error(err)
    } finally {
      setStudiesLoading(false)
    }
  }

  const filterStudies = () => {
    let filtered = studies

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredStudies(filtered)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Wit.me</h1>
            <p className="text-xs text-gray-500">스터디 모임 매칭 플랫폼</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user?.displayName} ({user?.role === 'leader' ? '모임장' : '사용자'})
            </span>
            {user?.role === 'leader' && (
              <Link
                href="/leader/studies/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
              >
                스터디 생성
              </Link>
            )}
            {user?.role === 'leader' && (
              <Link
                href="/leader/studies"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
              >
                내 스터디
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">스터디 찾기</h2>

          {!user && firebaseUser && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
              프로필 정보를 불러오지 못했습니다. 로그아웃 후 다시 로그인하거나,
              Firestore에 사용자 문서가 생성되었는지 확인해주세요.
            </div>
          )}

          {user?.role === 'leader' && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <p className="text-indigo-900 text-sm">
                모임장 계정입니다. 상단 <strong>스터디 생성</strong> 버튼으로 새
                스터디를 만들 수 있습니다. (최대 5개)
              </p>
              <Link
                href="/leader/studies/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm whitespace-nowrap"
              >
                스터디 만들기
              </Link>
            </div>
          )}

          {user?.role === 'user' && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
              <p className="font-semibold text-gray-900 mb-2">
                스터디를 만들고 싶으신가요?
              </p>
              <p className="mb-2">
                스터디 <strong>생성</strong>은 <strong>모임장</strong> 계정만
                가능합니다. 현재 계정은 <strong>일반 사용자</strong>입니다.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>로그아웃합니다.</li>
                <li>회원가입에서 역할을 <strong>모임장</strong>으로 선택합니다.</li>
                <li>새 이메일로 가입한 뒤 로그인합니다.</li>
                <li>상단에 <strong>스터디 생성</strong> 버튼이 표시됩니다.</li>
              </ol>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <input
              type="text"
              placeholder="검색어를 입력하세요 (제목, 설명)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition mb-4"
            />

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '전체' : cat}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {studiesLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">스터디를 불러오는 중...</div>
            </div>
          ) : filteredStudies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-gray-500 mb-2">검색 결과가 없습니다.</div>
              {searchQuery || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                >
                  검색 초기화
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudies.map((study) => (
                <Link key={study.id} href={`/studies/${study.id}`}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 h-full cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {study.title}
                        </h3>
                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                          {study.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {study.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📍</span>
                        <span className="line-clamp-1">{study.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📅</span>
                        <span>
                          {study.scheduledDate.toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">👥</span>
                        <span>
                          승인 {study.currentParticipants}/{study.maxParticipants}명
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm">
                        상세 정보
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
