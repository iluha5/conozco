import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получить все части речи для языка
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
      where: { id: parseInt(session.user.id) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User session expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const languageCode = searchParams.get('languageCode')

    if (!languageCode) {
      return NextResponse.json(
        { error: 'Language code is required' },
        { status: 400 }
      )
    }

    // Найти язык
    const language = await prisma.language.findUnique({
      where: { code: languageCode }
    })

    if (!language) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      )
    }

    // Получить части речи для языка
    const partsOfSpeech = await prisma.partOfSpeech.findMany({
      where: { languageId: language.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(partsOfSpeech)
  } catch (error) {
    console.error('Error fetching parts of speech:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
