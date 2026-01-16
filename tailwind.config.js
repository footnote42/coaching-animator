/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'pitch-green': '#1A3D1A',
                'tactics-white': '#F8F9FA',
            },
            fontFamily: {
                mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
                heading: ["'Inter'", "'Helvetica Neue'", 'sans-serif'],
                body: ["'Inter'", 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0px', // Enforce sharp corners
            },
            borderWidth: {
                DEFAULT: '1px', // Schematic borders
            },
        },
    },
    plugins: [],
}
