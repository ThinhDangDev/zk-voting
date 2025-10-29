/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // webpack(config, {}) {
  //   config.externals = config.externals.concat(['pino-pretty'])
  //   return config
  // },
}

module.exports = nextConfig
