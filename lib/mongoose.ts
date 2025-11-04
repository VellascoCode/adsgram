import mongoose from 'mongoose'

// Conexão Mongoose com cache para evitar múltiplas conexões em dev (hot-reload do Next.js)
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/adsgram'

type MongooseGlobal = typeof globalThis & {
  _mongooseConn?: Promise<typeof mongoose>
}

let cached = (global as MongooseGlobal)._mongooseConn

export async function connectToDB() {
  if (!cached) {
    cached = mongoose.connect(MONGODB_URI, {
      // opções padrão; ajustar conforme necessidade
      // bufferCommands: false,
    })
    ;(global as MongooseGlobal)._mongooseConn = cached
  }
  return cached
}
