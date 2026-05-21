import { buildCsvString, formatParticipantData } from '@/lib/csv-utils'

export { formatParticipantData } from '@/lib/csv-utils'

export const downloadCSV = (
  data: Array<Record<string, unknown>>,
  filename: string
) => {
  if (typeof document === 'undefined') {
    return
  }

  if (data.length === 0) {
    alert('다운로드할 데이터가 없습니다.')
    return
  }

  const csv = buildCsvString(data)
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
