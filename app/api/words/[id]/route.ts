import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - получить одно слово
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const word = await prisma.word.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id
      },
      include: {
        language: true,
        trainingSessions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(word)
  } catch (error) {
    console.error('Error fetching word:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - обновить слово
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Проверяем, что слово принадлежит пользователю
    const existingWord = await prisma.word.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }
    
    // Если передан languageCode, получаем ID языка
    const data: any = { ...body }
    if (body.languageCode) {
      const language = await prisma.language.findUnique({
        where: { code: body.languageCode },
      })
      
      if (!language) {
        return NextResponse.json(
          { error: 'Invalid language code' },
          { status: 400 }
        )
      }
      
      data.languageId = language.id
      delete data.languageCode
    }
    
    const word = await prisma.word.update({
      where: { id: params.id },
      data,
      include: {
        language: true,
      },
    })

    return NextResponse.json(word)
  } catch (error) {
    console.error('Error updating word:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - удалить слово
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем, что слово принадлежит пользователю
    const existingWord = await prisma.word.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    await prisma.word.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting word:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

