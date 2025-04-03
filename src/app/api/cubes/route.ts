import { NextRequest, NextResponse } from 'next/server'
import { ConnectMongoDb } from '../connectionDb/mongo'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const db = await ConnectMongoDb()
    const collection = db.collection('cubes')
    const body = await req.json()

    const newCube = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await collection.insertOne(newCube)
    return NextResponse.json(
      { message: 'Cube created successfully', _id: result.insertedId },
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
    const cookieStore = await cookies()
    const username = cookieStore.get('username')?.value

    if (!username) {
      return NextResponse.json(
        { error: 'Username not found in cookies' },
        { status: 400 }
      )
    }

    const db = await ConnectMongoDb()
    const collection = db.collection('cubes')

    const cubes = await collection.find({ username }).toArray()

    if (cubes.length === 0) {
      return NextResponse.json(
        { message: 'No cubes found for this username' }
      )
    }

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