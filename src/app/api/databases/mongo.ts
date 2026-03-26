import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function connectMongoDb() {
  if (!client) {
    try {
      const DATABASE_URL = process.env.DATABASE_URL_MONGO || ''
      client = new MongoClient(DATABASE_URL)
      await client.connect()
      console.log('Conexão com o MongoDB estabelecida com sucesso.')
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error)
      throw error
    }
  }

  return client.db('insightdb')
}
