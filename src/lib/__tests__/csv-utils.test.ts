import { describe, it, expect } from 'vitest'
import {
  buildCsvString,
  escapeCsvCell,
  formatParticipantData,
} from '@/lib/csv-utils'

describe('escapeCsvCell', () => {
  it('쉼표가 있으면 따옴표로 감싼다', () => {
    expect(escapeCsvCell('hello, world')).toBe('"hello, world"')
  })

  it('null/undefined는 빈 문자열', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
  })
})

describe('buildCsvString', () => {
  it('헤더와 행을 CSV로 만든다', () => {
    const csv = buildCsvString([
      { 이름: '홍길동', 이메일: 'a@b.com' },
      { 이름: '김철수', 이메일: 'c@d.com' },
    ])
    expect(csv).toContain('이름,이메일')
    expect(csv).toContain('홍길동,a@b.com')
  })

  it('빈 배열이면 빈 문자열', () => {
    expect(buildCsvString([])).toBe('')
  })
})

describe('formatParticipantData', () => {
  it('참가자 데이터를 한글 키로 변환한다', () => {
    const result = formatParticipantData([
      {
        email: 'test@test.com',
        displayName: '테스트',
        appliedAt: new Date('2026-05-21'),
      },
    ])
    expect(result[0].이메일).toBe('test@test.com')
    expect(result[0].이름).toBe('테스트')
    expect(result[0].신청일).toBeTruthy()
  })
})
