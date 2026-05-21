import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

let firebaseApp: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

function initFirebase() {
  if (typeof window === 'undefined') {
    throw new Error(
      'Firebase는 클라이언트 환경에서만 초기화할 수 있습니다.'
    )
  }

  if (firebaseApp) {
    return { firebaseApp, auth: auth!, db: db! }
  }

  const existing = getApps()
  if (existing.length > 0) {
    firebaseApp = existing[0]!
  } else {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) {
      throw new Error(
        'Firebase 환경 변수가 설정되지 않았습니다. .env.local을 확인해주세요.\n' +
        '필요한 변수: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, ' +
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID'
      )
    }

    firebaseApp = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  }

  auth = getAuth(firebaseApp)
  db = getFirestore(firebaseApp)

  return { firebaseApp, auth, db }
}

export function getFirebaseServices(): { auth: Auth; db: Firestore } {
  const services = initFirebase()
  return { auth: services.auth, db: services.db }
}
