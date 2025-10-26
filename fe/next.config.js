/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  webpack(config, {}) {
    // Fix Module not found: Can't resolve 'pino-pretty'
    // https://nextjs.org/docs/messages/module-not-found
    config.externals = config.externals.concat(['pino-pretty'])
    return config
  },
}

module.exports = nextConfig
