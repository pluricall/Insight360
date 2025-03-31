import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id

  try {
    const db = await connectToDatabase()
    const collection = db.collection('cubes')
    const body = await req.json()

    const updatedCube = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCube },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Cube not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Cube updated successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating cube:', error)
    return NextResponse.json(
      { error: 'Failed to update cube' },
      { status: 500 },
    )
  }
}
