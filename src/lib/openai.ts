import OpenAI from 'openai'

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

export const summarizeDescription = async (
  description: string
): Promise<string> => {
  const openai = getOpenAIClient()
  if (!openai) {
    return description
  }

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `다음 스터디 설명을 간결하게 요약해주세요. 최대 100글자 이내:\n\n${description}`,
        },
      ],
    })

    const text = response.choices[0]?.message?.content?.trim()
    return text || description
  } catch (error) {
    console.error('OpenAI 요약 오류:', error)
    throw new Error('설명 요약에 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}
