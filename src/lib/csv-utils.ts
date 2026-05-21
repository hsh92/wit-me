/** CSV 문자열 생성 (브라우저 API 없음, 단위 테스트 가능) */
export function buildCsvString(data: Array<Record<string, unknown>>): string {
  if (data.length === 0) {
    return ''
  }

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => escapeCsvCell(row[header]))
      .join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function formatParticipantData(
  participants: Array<{
    email: string
    displayName: string
    appliedAt?: Date
  }>
): Array<Record<string, string>> {
  return participants.map((p) => ({
    이메일: p.email,
    이름: p.displayName,
    신청일: p.appliedAt
      ? new Date(p.appliedAt).toLocaleDateString('ko-KR')
      : '',
  }))
}
