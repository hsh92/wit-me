import { Application } from '@/types/domain'

export function getApplicationStatusLabel(status: Application['status']): string {
  switch (status) {
    case 'pending':
      return '승인 대기'
    case 'approved':
      return '참여 승인'
    case 'rejected':
      return '참여 거절'
    default:
      return status
  }
}

export function getApplicationStatusMessage(
  status: Application['status'],
  studyTitle?: string
): string {
  const title = studyTitle ? `"${studyTitle}"` : '이 스터디'

  switch (status) {
    case 'pending':
      return `${title}에 신청이 접수되었습니다. 모임장의 승인을 기다리는 중입니다.`
    case 'approved':
      return `${title} 참여가 승인되었습니다. 참가자 수에 반영되었습니다.`
    case 'rejected':
      return `${title} 참여 신청이 거절되었습니다.`
    default:
      return ''
  }
}

export function getApplicationStatusStyles(status: Application['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 border-amber-200 text-amber-900'
    case 'approved':
      return 'bg-green-50 border-green-200 text-green-900'
    case 'rejected':
      return 'bg-red-50 border-red-200 text-red-900'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900'
  }
}
