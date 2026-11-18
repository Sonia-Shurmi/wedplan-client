import "server-only"

import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing. Add it to the client environment (server-side only).",
  )
}

const databaseName = process.env.DATABASE_NAME?.trim() || "wedplan"

interface MongoGlobal {
  __wedplanMongoClient?: MongoClient
  __wedplanDb?: Db
}

const globalForMongo = globalThis as typeof globalThis & MongoGlobal

export const mongoClient =
  globalForMongo.__wedplanMongoClient ??
  new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  })

if (!globalForMongo.__wedplanMongoClient) {
  globalForMongo.__wedplanMongoClient = mongoClient
}

export const db: Db =
  globalForMongo.__wedplanDb ?? mongoClient.db(databaseName)

if (!globalForMongo.__wedplanDb) {
  globalForMongo.__wedplanDb = db
}
