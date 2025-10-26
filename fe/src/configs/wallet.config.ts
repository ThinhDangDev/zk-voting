import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  walletConnectId: string
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    walletConnectId: '9133a8af8d550643d5b4c9f8fd110ba0',
  },

  /**
   * Production configurations
   */
  production: {
    walletConnectId: '9133a8af8d550643d5b4c9f8fd110ba0',
  },
}

/**
 * Module exports
 */
export default conf[env]
