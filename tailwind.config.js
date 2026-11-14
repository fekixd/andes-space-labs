/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.92)', opacity: '0.85' },
          '70%': { transform: 'scale(1.12)', opacity: '0' },
          '100%': { transform: 'scale(1.12)', opacity: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(260px)' },
          '100%': { transform: 'translateY(0%)' },
        },
        zzzFloat: {
          '0%': { transform: 'translate(0px, 0px) scale(0.8)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translate(14px, -24px) scale(1.15)', opacity: '0' },
        },
        packetTravel: {
          '0%': { left: '6%', opacity: '0.4' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { left: '92%', opacity: '0.4' },
        },
      },
      animation: {
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'scan-line': 'scanLine 4.2s ease-in-out infinite',
        'zzz-float': 'zzzFloat 2.8s ease-out infinite',
        'packet-travel': 'packetTravel 3.2s linear infinite',
      },
    },
  },
  plugins: [],
};
