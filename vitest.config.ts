import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  resolve: {
    alias: [
      {
        // Match @/* — try src/ first, then project root (mirrors tsconfig paths)
        find: /^@\/(.+)/,
        replacement: '$1',
        customResolver(resolved: string) {
          // Try src/ first
          const srcPath = path.resolve(__dirname, 'src', resolved);
          const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
          for (const ext of extensions) {
            if (fs.existsSync(srcPath + ext)) {
              return srcPath + ext;
            }
          }
          // Fall back to project root
          const rootPath = path.resolve(__dirname, resolved);
          for (const ext of extensions) {
            if (fs.existsSync(rootPath + ext)) {
              return rootPath + ext;
            }
          }
          // Default to src path (let Vite show the real error)
          return srcPath;
        },
      },
    ],
  },
  test: {
    exclude: [
      'node_modules/**',
      'archive/**',
      'tests/e2e/**',
    ],
  },
});
