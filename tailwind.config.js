/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0c0c0e',
        surface: '#18181b',
        sidebar: '#111113',
        'sidebar-hover': '#1c1c1f',
        surface2: '#27272a',
        surface3: '#3f3f46',
        accent: '#6366f1',
        emerald: '#10b981',
        coral: '#f43f5e',
        amber: '#f59e0b',
        'text-main': '#fafafa',
        'text-sub': '#a1a1aa',
        muted: '#52525b',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        mono: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    }
  },
  plugins: [],
}