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

// POST - добавить новое слово
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { foreignWord, translation, languageCode, examples } = await request.json()

    if (!foreignWord || !translation || !languageCode) {
      return NextResponse.json(
        { error: 'Foreign word, translation and language code are required' },
        { status: 400 }
      )
    }

    // Получаем ID языка по коду
    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    })

    if (!language) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      )
    }

    const word = await prisma.word.create({
      data: {
        userId: session.user.id,
        foreignWord: foreignWord.trim(),
        translation: translation.trim(),
        languageId: language.id,
        examples: examples || [],
      },
      include: {
        language: true,
      },
    })

    return NextResponse.json(word, { status: 201 })
  } catch (error: any) {
    console.error('Error creating word:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This word already exists for this language' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

