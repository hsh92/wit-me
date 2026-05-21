/** Firebase Auth 오류 코드 → 사용자 메시지 (순수 함수, 테스트 가능) */
export function getFirebaseErrorMessage(error: unknown): string {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.'
  }

  const code = getAuthErrorCode(error)

  if (code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.'
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다. 6자 이상으로 설정해주세요.'
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.'
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다.'
      case 'auth/wrong-password':
        return '잘못된 비밀번호입니다.'
      case 'auth/too-many-requests':
        return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
      case 'auth/operation-not-allowed':
        return '현재 이메일 회원가입이 비활성화되어 있습니다. Firebase Console에서 이메일/비밀번호 로그인을 활성화해주세요.'
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 잘못되었습니다.'
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인해주세요.'
      case 'auth/invalid-api-key':
        return 'Firebase API 키가 올바르지 않습니다. .env.local 설정을 확인해주세요.'
      default:
        return `오류: ${getErrorMessage(error)}`
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

export function getAuthErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code
    return typeof code === 'string' ? code : null
  }
  return null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/** Firestore 오류 메시지 */
export function getFirestoreErrorMessage(error: unknown): string {
  const code = getAuthErrorCode(error)

  if (code) {
    switch (code) {
      case 'permission-denied':
        return '데이터 저장 권한이 없습니다. Firestore 보안 규칙을 배포했는지 확인해주세요.'
      case 'unavailable':
        return 'Firestore 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
      case 'not-found':
        return '요청한 데이터를 찾을 수 없습니다.'
      default:
        return `데이터베이스 오류: ${getErrorMessage(error)}`
    }
  }

  return getFirebaseErrorMessage(error)
}
