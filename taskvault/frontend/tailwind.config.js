export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0B0F',
        surface: '#111318',
        elevated: '#161820',
        border: '#1E2028',
        accent: '#6366F1',
        accentAlt: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#F1F5F9',
        textMuted: '#64748B'
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        fadeIn: 'fadeIn 0.25s ease-out',
        slideUp: 'slideUp 0.25s ease-out'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
