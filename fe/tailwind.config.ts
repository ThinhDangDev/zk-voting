import type { Config } from 'tailwindcss'
const daisyui = require('daisyui/src/theming/themes')

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bg-light': "url('/bg-light.png')",
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyui['[data-theme=light]'],
          primary: '#FFCD75',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#000',
          'neutral-focus': '#212433',
          'base-200': '#F2F2F2',

          '--accent': '#2B3440',
          '--accent-text': '#ffffff',
          '--opaline': '#ffffffb3',
          '--opaline-content': '#000',
        },
      },
      {
        dark: {
          ...daisyui['[data-theme=dark]'],
          primary: '#FFCD75',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#ffffff',
          'neutral-focus': '#A6ACBA',

          '--accent': '#F4F4F5',
          '--accent-text': '#212433',
          '--opaline': '#ffffffb3',
          '--opaline-content': '#F4F4F5',
        },
      },
    ],
  },
}
export default config
