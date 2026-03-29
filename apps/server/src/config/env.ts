/**
 * Server environment configuration.
 * Single source of truth for all env variables.
 */

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  CLIENT_ORIGIN: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
  DATABASE_URL: optionalEnv('DATABASE_URL', 'postgres://localhost:5432/langchain_learn'),

  // LangChain / OpenAI (required in production)
  OPENAI_API_KEY: optionalEnv('OPENAI_API_KEY', ''),
  GOOGLE_API_KEY: optionalEnv('GOOGLE_API_KEY', ''),
} as const

export type Env = typeof env
