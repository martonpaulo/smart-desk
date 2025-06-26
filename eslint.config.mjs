import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const defineConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      // Disallow "any"
      '@typescript-eslint/no-explicit-any': 'error',

      // Disallow unused variables unless prefixed with "_"
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Don't require importing React in JSX files
      'react/react-in-jsx-scope': 'off',

      // Disallow default import of React and relative imports
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['default'],
              message: 'Do not import React explicitly',
            },
          ],
          patterns: ['../*', './*'],
        },
      ],

      // Allow JSX only in .tsx files
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],

      // Enforce import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^.+\\.(png|jpg|jpeg|gif|svg|webp)$'],
            ['^react$', '^react-', '^@react'],
            ['^@?\\w'],
            ['^@/'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  {
    files: ['src/app/components/*.{ts,tsx}'],
    rules: {
      // Enforce consistent import order in components
      'import/no-default-export': 'error',
    },
  },
];

export default defineConfig;
