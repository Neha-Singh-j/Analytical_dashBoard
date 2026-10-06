/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb',
          purple: '#6366f1',
          cyan: '#06b6d4',
          lightBlue: '#dbeafe',
          lightCyan: '#e0f2fe',
          lightYellow: '#fef9c3',
          lightPink: '#ffe4e6',
        }
      }
    },
  },
  plugins: [],
}
