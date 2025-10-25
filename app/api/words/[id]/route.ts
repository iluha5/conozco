import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить одно слово
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const word = await prisma.word.findUnique({
      where: { id: params.id },
      include: {
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
    const data = await request.json()
    
    const word = await prisma.word.update({
      where: { id: params.id },
      data,
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

