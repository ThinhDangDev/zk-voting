/**
 * Environment
 */
const getEnv = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'development'
    case 'production':
      return 'production'
    default:
      return 'development'
  }
}

export type Env = 'development' | 'production'
export const env: Env = getEnv()

/**
 * API Configuration
 */
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000',
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://ouwoclwnuyxtbweimeaf.supabase.co',
  bucket: 'zk-voting',
} as const
