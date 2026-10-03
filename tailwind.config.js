/** @type {import('tailwindcss').Config} */
// The palette is deliberately small: a warm paper/ink neutral scale, one muted teal accent, and
// desaturated status colours. Existing components use the slate/cyan/indigo/emerald/amber/rose
// class names, so redefining those scales restyles the whole app consistently.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f7f6f2', 100: '#efede7', 200: '#e2dfd6', 300: '#cfcbbf', 400: '#a29e92',
          500: '#7a766b', 600: '#5c584f', 700: '#433f38', 800: '#2d2a25', 850: '#24221e',
          900: '#1c1a17', 950: '#131210',
        },
        cyan: {
          50: '#eef5f4', 100: '#d9e8e6', 200: '#b5d3cf', 300: '#86b5b0', 400: '#5a9690',
          500: '#3f7c76', 600: '#2f6560', 700: '#27524e', 800: '#214340', 900: '#1c3836', 950: '#0f2120',
        },
        indigo: {
          50: '#f1f3f8', 100: '#e0e5ef', 200: '#c2cbdf', 300: '#a0adc9', 400: '#8896b3',
          500: '#6a789a', 600: '#566384', 700: '#444f6b', 800: '#363f55', 900: '#2b3244', 950: '#1b2030',
        },
        emerald: {
          50: '#f0f6f2', 100: '#dbeae0', 200: '#b9d5c3', 300: '#92bba1', 400: '#6fa77f',
          500: '#4f8a63', 600: '#3f7351', 700: '#335c42', 800: '#2b4a37', 900: '#243d2e', 950: '#142319',
        },
        amber: {
          50: '#faf6ea', 100: '#f2e8c8', 200: '#e6d193', 300: '#d9ba5f', 400: '#c9a24d',
          500: '#b38a30', 600: '#96721f', 700: '#78591a', 800: '#5f4719', 900: '#4d3a17', 950: '#2b200b',
        },
        rose: {
          50: '#faf1ef', 100: '#f3dcd8', 200: '#e8bbb4', 300: '#dc978d', 400: '#cc7a70',
          500: '#b85c52', 600: '#9c453c', 700: '#7f362f', 800: '#672d28', 900: '#552823', 950: '#2e1411',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '"Segoe UI"', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
