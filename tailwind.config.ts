import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { shift: { bg: '#09090b', panel: '#111114', line: '#27272a', blue: '#6d7cff', amethyst: '#a78bfa' } }, boxShadow: { aura: '0 0 100px rgba(109,124,255,.15)' } } },
  plugins: [],
};
export default config;
