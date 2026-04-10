import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.OLLAMA_URL': JSON.stringify(process.env.VITE_OLLAMA_URL ?? ''),
    'process.env.OLLAMA_MODEL': JSON.stringify(process.env.VITE_OLLAMA_MODEL ?? ''),
  },
  resolve: {
    alias: {
      Modules: path.join(repoRoot, 'app/javascript/modules'),
    },
    // Source files live outside the Vite project root (app/javascript/modules/…).
    // Without dedupe, Rollup walks up from the importer's directory and misses
    // prototypes/financial-interview-demo/node_modules. Dedupe forces all these
    // packages to always resolve from this project's own node_modules.
    dedupe: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
