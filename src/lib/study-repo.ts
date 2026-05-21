import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  Firestore,
} from 'firebase/firestore'
import { User, Study, Application } from '@/types/domain'

function toDate(value: unknown): Date {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }
  if (value instanceof Date) {
    return value
  }
  return new Date()
}

export const createUserProfile = async (
  db: Firestore,
  uid: string,
  email: string,
  displayName: string,
  role: 'user' | 'leader'
) => {
  const userRef = doc(db, 'users', uid)
  const userData = {
    email,
    displayName,
    role,
    createdAt: Timestamp.now(),
  }
  await setDoc(userRef, userData)
}

export const getUserProfile = async (
  db: Firestore,
  uid: string
): Promise<User | null> => {
  const userRef = doc(db, 'users', uid)
  const docSnap = await getDoc(userRef)
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: toDate(data.createdAt),
    }
  }
  return null
}

export const createStudy = async (
  db: Firestore,
  study: Omit<Study, 'id' | 'currentParticipants' | 'createdAt' | 'updatedAt'>
) => {
  const studyRef = doc(collection(db, 'studies'))
  const studyData = {
    ...study,
    scheduledDate: Timestamp.fromDate(study.scheduledDate),
    currentParticipants: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  await setDoc(studyRef, studyData)
  return studyRef.id
}

export const getStudy = async (
  db: Firestore,
  studyId: string
): Promise<Study | null> => {
  const studyRef = doc(db, 'studies', studyId)
  const docSnap = await getDoc(studyRef)
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: studyId,
      title: data.title,
      description: data.description,
      category: data.category,
      scheduledDate: toDate(data.scheduledDate),
      location: data.location,
      maxParticipants: data.maxParticipants,
      currentParticipants: data.currentParticipants || 0,
      leaderUid: data.leaderUid,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    }
  }
  return null
}

export const getAllStudies = async (db: Firestore): Promise<Study[]> => {
  const studiesRef = collection(db, 'studies')
  const q = query(studiesRef, where('status', '==', 'open'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category,
      scheduledDate: toDate(data.scheduledDate),
      location: data.location,
      maxParticipants: data.maxParticipants,
      currentParticipants: data.currentParticipants || 0,
      leaderUid: data.leaderUid,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    }
  })
}

export const getLeaderStudies = async (
  db: Firestore,
  leaderUid: string
): Promise<Study[]> => {
  const studiesRef = collection(db, 'studies')
  const q = query(studiesRef, where('leaderUid', '==', leaderUid))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category,
      scheduledDate: toDate(data.scheduledDate),
      location: data.location,
      maxParticipants: data.maxParticipants,
      currentParticipants: data.currentParticipants || 0,
      leaderUid: data.leaderUid,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    }
  })
}

export const updateStudy = async (
  db: Firestore,
  studyId: string,
  updates: Partial<Study>
) => {
  const studyRef = doc(db, 'studies', studyId)
  const { id: _id, scheduledDate, ...rest } = updates
  const payload: Record<string, unknown> = {
    ...rest,
    updatedAt: Timestamp.now(),
  }
  if (scheduledDate) {
    payload.scheduledDate = Timestamp.fromDate(scheduledDate)
  }
  await updateDoc(studyRef, payload)
}

export const deleteStudy = async (db: Firestore, studyId: string) => {
  const studyRef = doc(db, 'studies', studyId)
  await deleteDoc(studyRef)
}

export const createApplication = async (
  db: Firestore,
  studyId: string,
  userId: string,
  message: string
) => {
  const appRef = doc(collection(db, 'applications'))
  const appData = {
    studyId,
    userId,
    message,
    status: 'pending',
    appliedAt: Timestamp.now(),
  }
  await setDoc(appRef, appData)
  return appRef.id
}

export const getApplications = async (
  db: Firestore,
  studyId: string
): Promise<Application[]> => {
  const appsRef = collection(db, 'applications')
  const q = query(appsRef, where('studyId', '==', studyId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      studyId: data.studyId,
      userId: data.userId,
      message: data.message,
      status: data.status,
      appliedAt: toDate(data.appliedAt),
      respondedAt: data.respondedAt ? toDate(data.respondedAt) : undefined,
    }
  })
}

export const getUserApplications = async (
  db: Firestore,
  userId: string
): Promise<Application[]> => {
  const appsRef = collection(db, 'applications')
  const q = query(appsRef, where('userId', '==', userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      studyId: data.studyId,
      userId: data.userId,
      message: data.message,
      status: data.status,
      appliedAt: toDate(data.appliedAt),
      respondedAt: data.respondedAt ? toDate(data.respondedAt) : undefined,
    }
  })
}

export const getApplicationById = async (
  db: Firestore,
  appId: string
): Promise<Application | null> => {
  const appRef = doc(db, 'applications', appId)
  const docSnap = await getDoc(appRef)
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: appId,
      studyId: data.studyId,
      userId: data.userId,
      message: data.message,
      status: data.status,
      appliedAt: toDate(data.appliedAt),
      respondedAt: data.respondedAt ? toDate(data.respondedAt) : undefined,
    }
  }
  return null
}

export const getUserApplicationForStudy = async (
  db: Firestore,
  studyId: string,
  userId: string
): Promise<Application | null> => {
  const appsRef = collection(db, 'applications')
  const q = query(
    appsRef,
    where('studyId', '==', studyId),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }

  const docSnap = querySnapshot.docs[0]
  const data = docSnap.data()
  return {
    id: docSnap.id,
    studyId: data.studyId,
    userId: data.userId,
    message: data.message,
    status: data.status,
    appliedAt: toDate(data.appliedAt),
    respondedAt: data.respondedAt ? toDate(data.respondedAt) : undefined,
  }
}

export type StudyApplicationStats = {
  approved: number
  pending: number
  rejected: number
}

export const getStudyApplicationStats = async (
  db: Firestore,
  studyId: string
): Promise<StudyApplicationStats> => {
  const apps = await getApplications(db, studyId)
  return {
    approved: apps.filter((a) => a.status === 'approved').length,
    pending: apps.filter((a) => a.status === 'pending').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }
}

/** 승인된 신청 수를 스터디 currentParticipants에 반영 */
export const syncStudyApprovedCount = async (
  db: Firestore,
  studyId: string
): Promise<number> => {
  const stats = await getStudyApplicationStats(db, studyId)
  await updateStudy(db, studyId, {
    currentParticipants: stats.approved,
  })
  return stats.approved
}

export const updateApplication = async (
  db: Firestore,
  appId: string,
  status: 'approved' | 'rejected'
) => {
  const existing = await getApplicationById(db, appId)
  if (!existing) {
    throw new Error('신청 정보를 찾을 수 없습니다.')
  }

  const appRef = doc(db, 'applications', appId)
  await updateDoc(appRef, {
    status,
    respondedAt: Timestamp.now(),
  })

  await syncStudyApprovedCount(db, existing.studyId)
}

export const checkDuplicateApplication = async (
  db: Firestore,
  studyId: string,
  userId: string
): Promise<boolean> => {
  const application = await getUserApplicationForStudy(db, studyId, userId)
  return application !== null
}
