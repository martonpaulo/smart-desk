import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

// Mimic __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Configuration for Next.js app
const nextCompat = compat.extends('next/core-web-vitals');

const config = [
  // Global ignores
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'dist/**',
      'build/**',
    ],
  },
  ...nextCompat,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'off', // Disabled for App Router
      '@next/next/no-img-element': 'error',
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
  },
];

export default config;
