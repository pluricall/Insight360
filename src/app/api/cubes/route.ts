import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../db'

export async function POST(req: NextRequest) {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('cubes')
    const body = await req.json()

    const newCube = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await collection.insertOne(newCube)
    return NextResponse.json(
      { message: 'Cube created successfully', id: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating cube:', error)
    return NextResponse.json(
      { error: 'Failed to create cube' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('cubes')
    const cubes = await collection.find({}).toArray()

    return NextResponse.json(cubes, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching cubes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cubes' },
      { status: 500 },
    )
  }
}
