import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#101713',
          surface: '#18211D',
          surfaceHover: '#243025',
        },
        border: { hairline: '#314034' },
        accent: { amber: '#D97706', text: 'var(--color-accent-text)' },
        status: {
          cobalt: '#2563EB',
          emerald: '#059669',
          rose: '#E11D48',
        },
        text: { primary: '#F1F2E9', secondary: '#A5B1A8' },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
