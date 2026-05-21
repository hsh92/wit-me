'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getFirebaseServices } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'
import {
  getStudy,
  getApplications,
  updateApplication,
  getUserProfile,
} from '@/lib/study-repo'
import { downloadCSV, formatParticipantData } from '@/lib/csv'
import { Study, Application, User } from '@/types/domain'

interface ApplicationWithDetails extends Application {
  userProfile?: User
}

export default function ManageApplicants() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.id as string
  const { firebaseUser, user, loading } = useAuth()

  const [study, setStudy] = useState<Study | null>(null)
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null)

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
    if (firebaseUser && studyId) {
      loadData()
    }
  }, [firebaseUser, studyId])

  const loadData = async () => {
    try {
      setPageLoading(true)
      const { db } = getFirebaseServices()

      const studyData = await getStudy(db, studyId)
      if (!studyData) {
        setError('스터디를 찾을 수 없습니다.')
        return
      }

      if (studyData.leaderUid !== firebaseUser!.uid) {
        router.push('/')
        return
      }

      setStudy(studyData)

      const apps = await getApplications(db, studyId)
      const appsWithDetails: ApplicationWithDetails[] = []

      for (const app of apps) {
        const userProfile = await getUserProfile(db, app.userId)
        appsWithDetails.push({
          ...app,
          userProfile: userProfile ?? undefined,
        })
      }

      setApplications(appsWithDetails)
    } catch (err) {
      setError('데이터를 불러오는 데 실패했습니다.')
      console.error(err)
    } finally {
      setPageLoading(false)
    }
  }

  const handleUpdateApplication = async (
    appId: string,
    newStatus: 'approved' | 'rejected'
  ) => {
    try {
      setUpdatingAppId(appId)
      const { db } = getFirebaseServices()
      await updateApplication(db, appId, newStatus)

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      )
    } catch (err) {
      setError('신청 상태 변경에 실패했습니다.')
      console.error(err)
    } finally {
      setUpdatingAppId(null)
    }
  }

  const handleDownloadCSV = () => {
    const approvedApps = applications.filter((app) => app.status === 'approved')
    const participants = approvedApps.map((app) => ({
      email: app.userProfile?.email || '',
      displayName: app.userProfile?.displayName || '',
      appliedAt: app.appliedAt,
    }))

    const csvData = formatParticipantData(participants)
    downloadCSV(csvData, `${study?.title || 'participants'}-참가자명단`)
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

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (!study || error === '스터디를 찾을 수 없습니다.') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
          <Link href="/leader/studies" className="text-indigo-600 hover:underline font-semibold">
            내 스터디로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const pendingApps = applications.filter((app) => app.status === 'pending')
  const approvedApps = applications.filter((app) => app.status === 'approved')
  const rejectedApps = applications.filter((app) => app.status === 'rejected')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/leader/studies"
          className="text-indigo-600 hover:underline font-semibold mb-6 inline-block"
        >
          ← 내 스터디로
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {study.title} - 신청자 관리
          </h1>
          <p className="text-gray-600 mb-6">
            신청자: {applications.length}명 | 승인: {approvedApps.length}명 | 대기: {pendingApps.length}명 | 거절: {rejectedApps.length}명
          </p>

          <button
            onClick={handleDownloadCSV}
            disabled={approvedApps.length === 0}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            참가자 명단 다운로드 (CSV)
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-500">신청한 사용자가 없습니다.</div>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingApps.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
                  <h2 className="font-bold text-gray-900">
                    대기 중 ({pendingApps.length}명)
                  </h2>
                </div>
                <div className="divide-y">
                  {pendingApps.map((app) => (
                    <div key={app.id} className="p-6 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {app.userProfile?.displayName || '(이름 없음)'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {app.userProfile?.email}
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {app.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          신청일: {app.appliedAt.toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            handleUpdateApplication(app.id, 'approved')
                          }
                          disabled={updatingAppId === app.id}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition"
                        >
                          승인
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplication(app.id, 'rejected')
                          }
                          disabled={updatingAppId === app.id}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approvedApps.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <h2 className="font-bold text-gray-900">
                    승인됨 ({approvedApps.length}명)
                  </h2>
                </div>
                <div className="divide-y">
                  {approvedApps.map((app) => (
                    <div key={app.id} className="p-6">
                      <h3 className="font-semibold text-gray-900">
                        {app.userProfile?.displayName || '(이름 없음)'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.userProfile?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        승인일: {app.respondedAt?.toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rejectedApps.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                  <h2 className="font-bold text-gray-900">
                    거절됨 ({rejectedApps.length}명)
                  </h2>
                </div>
                <div className="divide-y">
                  {rejectedApps.map((app) => (
                    <div key={app.id} className="p-6">
                      <h3 className="font-semibold text-gray-900">
                        {app.userProfile?.displayName || '(이름 없음)'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.userProfile?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        거절일: {app.respondedAt?.toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
