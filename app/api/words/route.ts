import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получить все слова текущего пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверить, существует ли пользователь в базе данных
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User session expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const languageCode = searchParams.get('languageCode')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id
    }

    if (languageCode) {
      // Получаем ID языка по коду
      const language = await prisma.language.findUnique({
        where: { code: languageCode },
      })
      if (language) {
        where.languageId = language.id
      }
    }
    if (status) {
      where.status = status
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        language: true,
        baseWord: {
          include: {
            partOfSpeech: true,
            translations: {
              where: { language: { code: 'ru' } },
              orderBy: { priority: 'asc' }
            },
            examples: {
              include: {
                pronoun: true
              }
            },
            grammaticalExamples: {
              include: {
                pronoun: true,
                tense: true
              }
            }
          }
        },
        trainingSessions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })

    return NextResponse.json(words)
  } catch (error) {
    console.error('Error fetching words:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - добавить слово из базы данных
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверить, существует ли пользователь в базе данных
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User session expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const { baseWordId, customTranslation } = await request.json()

    if (!baseWordId) {
      return NextResponse.json(
        { error: 'Base word ID is required' },
        { status: 400 }
      )
    }

    // Проверить, существует ли базовое слово
    const baseWord = await prisma.baseWord.findUnique({
      where: { id: baseWordId },
      include: {
        language: true,
        partOfSpeech: true,
        translations: {
          where: { language: { code: 'ru' } },
          orderBy: { priority: 'asc' },
          take: 1
        }
      }
    })

    if (!baseWord) {
      return NextResponse.json(
        { error: 'Word not found in database' },
        { status: 404 }
      )
    }

    // Проверить, не добавил ли пользователь уже это слово
    const existingWord = await prisma.word.findUnique({
      where: {
        userId_baseWordId: {
          userId: session.user.id,
          baseWordId: baseWord.id
        }
      }
    })

    if (existingWord) {
      return NextResponse.json(
        { error: 'You already have this word in your vocabulary' },
        { status: 409 }
      )
    }

    // Создать слово для пользователя
    const word = await prisma.word.create({
      data: {
        userId: session.user.id,
        baseWordId: baseWord.id,
        customTranslation: customTranslation?.trim() || null,
        languageId: baseWord.languageId,
      },
      include: {
        language: true,
        baseWord: {
          include: {
            partOfSpeech: true,
            translations: {
              where: { language: { code: 'ru' } },
              orderBy: { priority: 'asc' }
            },
            examples: {
              include: {
                pronoun: true
              }
            },
            grammaticalExamples: {
              include: {
                pronoun: true,
                tense: true
              }
            }
          }
        },
      },
    })

    return NextResponse.json(word, { status: 201 })
  } catch (error: any) {
    console.error('Error creating word:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

