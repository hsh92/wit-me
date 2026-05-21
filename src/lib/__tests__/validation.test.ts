import { describe, it, expect } from 'vitest'
import {
  canCreateMoreStudies,
  isValidEmail,
  isValidPassword,
  MAX_LEADER_STUDIES,
} from '@/lib/validation'

describe('canCreateMoreStudies', () => {
  it('5개 미만이면 생성 가능', () => {
    expect(canCreateMoreStudies(4)).toBe(true)
  })

  it('5개면 생성 불가', () => {
    expect(canCreateMoreStudies(MAX_LEADER_STUDIES)).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('유효한 이메일을 통과시킨다', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('잘못된 이메일을 거부한다', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('6자 이상이면 통과', () => {
    expect(isValidPassword('123456')).toBe(true)
  })

  it('6자 미만이면 거부', () => {
    expect(isValidPassword('12345')).toBe(false)
  })
})
