/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary: Deep Jungle Green
        jungle: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#bcdcce',
          300: '#8fc3af',
          400: '#5fa48b',
          500: '#3d8870',
          600: '#2d6d5a',
          700: '#1A4D2E', // PRIMARY
          800: '#1f4439',
          900: '#1b3830',
          950: '#0d1f1b',
        },
        // Accent: Golden Amber
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F2A922', // PRIMARY
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Accent: Coral Reef Blue
        reef: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Volcanic Black (for dark mode)
        volcanic: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Cream background
        cream: '#FDFCF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.stone[600]'),
            '--tw-prose-headings': theme('colors.stone[900]'),
            '--tw-prose-links': theme('colors.jungle[700]'),
            '--tw-prose-bold': theme('colors.stone[900]'),
            '--tw-prose-code': theme('colors.jungle[700]'),
            maxWidth: 'none',
            a: {
              color: theme('colors.jungle[700]'),
              textDecoration: 'underline',
              textDecorationColor: theme('colors.jungle[300]'),
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.jungle[600]'),
                textDecorationColor: theme('colors.jungle[600]'),
              },
            },
            h1: {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '700',
            },
            h2: {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '600',
            },
            h3: {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '600',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.stone[300]'),
            '--tw-prose-headings': theme('colors.stone[100]'),
            '--tw-prose-links': theme('colors.amber[400]'),
            '--tw-prose-bold': theme('colors.stone[100]'),
            '--tw-prose-code': theme('colors.amber[400]'),
            a: {
              color: theme('colors.amber[400]'),
              '&:hover': {
                color: theme('colors.amber[300]'),
              },
            },
          },
        },
      }),
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
