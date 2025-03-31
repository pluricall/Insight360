import { env } from '@/env'
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function connectToDatabase() {
  if (!client) {
    try {
      const DATABASE_URL = env.DATABASE_URL || ''
      client = new MongoClient(DATABASE_URL)
      await client.connect()
      console.log('Conexão com o MongoDB estabelecida com sucesso.')
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error)
      throw error
    }
  }

  return client.db('insight360')
}
