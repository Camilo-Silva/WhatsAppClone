/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp': {
          'green': '#075e54',
          'light-green': '#25d366',
          'bubble-out': '#d9fdd3',
          'bubble-in': '#f0f0f0',
          'read-blue': '#4fc3f7'  // Azul para tildes leídas
        }
      }
    },
  },
  plugins: [],
}
