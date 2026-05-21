import { describe, it, expect } from 'vitest'
import {
  getFirebaseErrorMessage,
  getFirestoreErrorMessage,
  getAuthErrorCode,
} from '@/lib/auth-errors'

describe('getAuthErrorCode', () => {
  it('Firebase 스타일 오류에서 code를 추출한다', () => {
    expect(getAuthErrorCode({ code: 'auth/invalid-email' })).toBe(
      'auth/invalid-email'
    )
  })

  it('일반 오류에서는 null을 반환한다', () => {
    expect(getAuthErrorCode(new Error('fail'))).toBeNull()
  })
})

describe('getFirebaseErrorMessage', () => {
  it('이미 사용 중인 이메일 메시지를 반환한다', () => {
    expect(
      getFirebaseErrorMessage({ code: 'auth/email-already-in-use' })
    ).toContain('이미 사용 중인 이메일')
  })

  it('약한 비밀번호 메시지를 반환한다', () => {
    expect(getFirebaseErrorMessage({ code: 'auth/weak-password' })).toContain(
      '6자 이상'
    )
  })

  it('operation-not-allowed 시 Firebase 설정 안내를 포함한다', () => {
    expect(
      getFirebaseErrorMessage({ code: 'auth/operation-not-allowed' })
    ).toContain('Firebase Console')
  })
})

describe('getFirestoreErrorMessage', () => {
  it('permission-denied 메시지를 반환한다', () => {
    expect(
      getFirestoreErrorMessage({ code: 'permission-denied' })
    ).toContain('보안 규칙')
  })
})
