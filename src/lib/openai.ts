import OpenAI from 'openai'

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

export type SummarizeResult = {
  summary: string
  fallback: boolean
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

export const summarizeDescription = async (
  description: string
): Promise<SummarizeResult> => {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error(
      'OPENAI_API_KEY가 설정되지 않았습니다. .env.local에 키를 추가한 뒤 서버를 재시작해주세요.'
    )
  }

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            '당신은 스터디 모임 소개글을 짧게 다듬는 도우미입니다. 핵심만 남기고 100자 이내 한국어로 작성하세요.',
        },
        {
          role: 'user',
          content: description,
        },
      ],
    })

    const text = response.choices[0]?.message?.content?.trim()
    if (!text) {
      throw new Error('OpenAI가 빈 응답을 반환했습니다.')
    }

    return { summary: text, fallback: false }
  } catch (error) {
    console.error('OpenAI 요약 오류:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('설명 요약에 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}
