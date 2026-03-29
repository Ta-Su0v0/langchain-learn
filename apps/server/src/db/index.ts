import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import { env } from '../config/env.js'
import * as schema from './schema.js'

const sql = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
})

export const db = drizzle(sql, { schema })
