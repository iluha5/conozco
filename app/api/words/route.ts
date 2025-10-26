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
    const language = searchParams.get('language')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id
    }
    
    if (language) {
      where.language = language
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

    const { foreignWord, translation, language, examples } = await request.json()

    if (!foreignWord || !translation || !language) {
      return NextResponse.json(
        { error: 'Foreign word, translation and language are required' },
        { status: 400 }
      )
    }

    const word = await prisma.word.create({
      data: {
        userId: session.user.id,
        foreignWord: foreignWord.trim(),
        translation: translation.trim(),
        language,
        examples: examples || [],
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

