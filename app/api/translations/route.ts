import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMockTranslations, type Language } from '@/lib/translation-mock'

export async function POST(request: NextRequest) {
  try {
    const { word, language } = await request.json()

    if (!word || !language) {
      return NextResponse.json(
        { error: 'Word and language are required' },
        { status: 400 }
      )
    }

    const normalizedWord = word.toLowerCase().trim()

    // Проверяем кеш
    const cached = await prisma.translationCache.findUnique({
      where: {
        sourceText_sourceLanguage: {
          sourceText: normalizedWord,
          sourceLanguage: language as Language,
        },
      },
    })

    if (cached) {
      return NextResponse.json({
        translations: cached.translations,
        cached: true,
      })
    }

    // Получаем моковые переводы
    const translations = await getMockTranslations(normalizedWord, language as Language)

    // Сохраняем в кеш
    await prisma.translationCache.create({
      data: {
        sourceText: normalizedWord,
        sourceLanguage: language as Language,
        translations: translations,
      },
    })

    return NextResponse.json({
      translations,
      cached: false,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

