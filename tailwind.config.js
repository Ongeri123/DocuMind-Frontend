/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#f4f6f9',
        surface: '#ffffff',
        sidebar: '#1e2a3b',
        'sidebar-hover': '#263447',
        surface2: '#eef1f5',
        accent: '#2563eb',
        coral: '#dc2626',
        periwinkle: '#3b82f6',
        amber: '#d97706',
        'text-main': '#0f172a',
        muted: '#64748b',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['Lora', 'serif'],
      }
    }
  },
  plugins: [],
}