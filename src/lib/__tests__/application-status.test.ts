import { describe, it, expect } from 'vitest'
import {
  getApplicationStatusLabel,
  getApplicationStatusMessage,
} from '@/lib/application-status'

describe('application-status', () => {
  it('pending 상태 라벨', () => {
    expect(getApplicationStatusLabel('pending')).toBe('승인 대기')
  })

  it('approved 상태 메시지에 승인 안내 포함', () => {
    expect(getApplicationStatusMessage('approved', '테스트')).toContain('승인')
  })
})
