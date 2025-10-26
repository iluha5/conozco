import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMockTranslations, type LanguageCode } from '@/lib/translation-mock'

export async function POST(request: NextRequest) {
  try {
    const { word, languageCode } = await request.json()

    if (!word || !languageCode) {
      return NextResponse.json(
        { error: 'Word and language code are required' },
        { status: 400 }
      )
    }

    const normalizedWord = word.toLowerCase().trim()

    // Получаем ID языка по коду
    const language = await prisma.language.findUnique({
      where: { code: languageCode as LanguageCode },
    })

    if (!language) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      )
    }

    // Проверяем кеш
    const cached = await prisma.translationCache.findUnique({
      where: {
        sourceText_sourceLanguageId: {
          sourceText: normalizedWord,
          sourceLanguageId: language.id,
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
    const translations = await getMockTranslations(normalizedWord, languageCode as LanguageCode)

    // Сохраняем в кеш
    await prisma.translationCache.create({
      data: {
        sourceText: normalizedWord,
        sourceLanguageId: language.id,
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

