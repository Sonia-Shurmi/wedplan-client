import "server-only"

import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing. Add it to the client environment (server-side only).",
  )
}

const mongoUri: string = uri
const databaseName = process.env.DATABASE_NAME?.trim() || "wedplan"

interface MongoGlobal {
  __wedplanMongoClient?: MongoClient
}

const globalForMongo = globalThis as typeof globalThis & MongoGlobal

const clientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
}

function createClient() {
  return new MongoClient(mongoUri, clientOptions)
}

function isDestroyed(client: MongoClient | undefined) {
  const topology = (
    client as unknown as { topology?: { isDestroyed?: () => boolean } } | undefined
  )?.topology

  return topology?.isDestroyed?.() ?? false
}

/**
 * Serverless invocations can leave a cached MongoClient with a closed topology.
 * Return a fresh client in that case and keep it on globalThis for warm reuse.
 */
function getClient() {
  let client = globalForMongo.__wedplanMongoClient

  if (!client || isDestroyed(client)) {
    client = createClient()
    globalForMongo.__wedplanMongoClient = client
  }

  return client
}

function getDb() {
  return getClient().db(databaseName)
}

/**
 * Proxies keep Better Auth's module-scoped adapter from pinning a stale client.
 * Every collection/session access resolves against a live client.
 */
export const mongoClient = new Proxy({} as MongoClient, {
  get(_target, property) {
    const client = getClient()
    const value = Reflect.get(client, property, client)
    return typeof value === "function" ? value.bind(client) : value
  },
  getOwnPropertyDescriptor(_target, property) {
    return Reflect.getOwnPropertyDescriptor(getClient(), property)
  },
  has(_target, property) {
    return Reflect.has(getClient(), property)
  },
})

export const db = new Proxy({} as Db, {
  get(_target, property) {
    const database = getDb()
    const value = Reflect.get(database, property, database)
    return typeof value === "function" ? value.bind(database) : value
  },
  getOwnPropertyDescriptor(_target, property) {
    return Reflect.getOwnPropertyDescriptor(getDb(), property)
  },
  has(_target, property) {
    return Reflect.has(getDb(), property)
  },
})
