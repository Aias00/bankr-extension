module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: {
          900: '#0b1220',
          800: '#121a2b',
          700: '#1a2438'
        },
        accent: {
          500: '#16a34a',
          600: '#15803d',
          700: '#166534'
        },
        warning: {
          500: '#f59e0b'
        },
        danger: {
          500: '#ef4444'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(22, 163, 74, 0.3)'
      }
    }
  },
  plugins: []
};
