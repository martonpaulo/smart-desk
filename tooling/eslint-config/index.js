import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';

// Plugins
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import reactPlugin from 'eslint-plugin-react';
import jsonPlugin from 'eslint-plugin-json';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

// Mimic __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Base configuration for all TypeScript projects
export const baseConfig = {
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      project: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    'simple-import-sort': simpleImportSort,
    import: importPlugin,
  },
  rules: {
    // Disallow "any"
    '@typescript-eslint/no-explicit-any': 'error',
    // Disallow unused variables unless prefixed with "_"
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Enforce import sorting
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Side effect imports first
          ['^\\u0000'],
          // Node.js built-ins
          [`^(${require('module').builtinModules.join('|')})(/.*|$)`],
          // React packages
          ['^react', '^@react', '^next', '^@next'],
          // External packages
          ['^@?\\w'],
          // Internal monorepo packages
          ['^@smart-desk(/.*|$)'],
          // Absolute imports and other internal paths
          ['^@/'],
          // Relative imports
          ['^\\.'],
          // Style imports
          ['^.+\\.s?css$'],
          // Image imports
          ['^.+\\.(png|jpg|jpeg|gif|svg|webp)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
};

// Configuration for React-based libraries (e.g., ui-web, ui-native)
export const reactLibraryConfig = {
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  },
};

// Configuration specifically for the Next.js app
export const nextjsConfig = {
  ...compat.extends('next/core-web-vitals', 'plugin:@typescript-eslint/recommended')[0],
  ...reactLibraryConfig, // Inherit common React rules
  rules: {
    ...reactLibraryConfig.rules,
    // Add any Next.js specific overrides here
  },
};

// Configuration specifically for the React Native app
export const nativeConfig = {
  ...compat.extends('plugin:react-native/all')[0],
  ...reactLibraryConfig, // Inherit common React rules
  rules: {
    ...reactLibraryConfig.rules,
    // Add any React Native specific overrides here
    'react-native/no-raw-text': ['error', { skip: ['Button'] }], // Example override
  },
};

export const supabaseConfig = {
  languageOptions: {
    globals: {
      ...globals.deno,
    },
  },
};

export const jsonConfig = {
  languageOptions: {
    globals: {
      ...globals.json,
    },
  },
  plugins: {
    json: jsonPlugin,
  },
  rules: {
    'json/*': 'error',
  },
};
