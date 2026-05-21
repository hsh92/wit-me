import { NextRequest, NextResponse } from 'next/server'
import { summarizeDescription } from '@/lib/openai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const description =
      typeof body?.description === 'string' ? body.description : ''

    if (!description.trim()) {
      return NextResponse.json(
        { error: '설명을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { error: '설명이 너무 깁니다. (최대 5000자)' },
        { status: 400 }
      )
    }

    const result = await summarizeDescription(description)
    return NextResponse.json({
      summary: result.summary,
      fallback: result.fallback,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '요약 처리 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
