/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tüm alt klasörlerdeki JS/JSX dosyalarını tara
  ],
  theme: {
    extend: {
      colors: {
        // IDAS kurumsal renklerini buraya tanımlayabiliriz
        havelsanBlue: '#0F172A',
      }
    },
  },
  plugins: [],
}