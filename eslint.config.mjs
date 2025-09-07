import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';
import { builtinModules } from 'module';
import gitignore from 'eslint-config-flat-gitignore';

// Plugins
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import reactPlugin from 'eslint-plugin-react';
import jsonPlugin from 'eslint-plugin-json';
import jsonParser from 'jsonc-eslint-parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

// Mimic __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Base configuration for all TypeScript projects
const baseConfig = {
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
          [`^(${builtinModules.join('|')})(/.*|$)`],
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
const reactLibraryConfig = {
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  },
};

// Note: Next.js specific configuration is handled by apps/web/eslint.config.mjs

// Configuration specifically for the React Native app
const nativeCompat = compat.extends('plugin:react-native/all');
const nativeConfig = {
  ...nativeCompat[0],
  plugins: {
    ...(nativeCompat[0]?.plugins || {}),
    ...(reactLibraryConfig.plugins || {}),
  },
  rules: {
    ...(nativeCompat[0]?.rules || {}),
    ...(reactLibraryConfig.rules || {}),
    // Add any React Native specific overrides here
    'react-native/no-raw-text': ['error', { skip: ['Button'] }], // Example override
  },
};

const supabaseConfig = {
  languageOptions: {
    globals: {
      ...globals.deno,
    },
  },
};

const jsonConfig = {
  languageOptions: {
    parser: jsonParser,
  },
  plugins: {
    json: jsonPlugin,
  },
  rules: {
    'json/*': 'error',
  },
};

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  gitignore(),
  {
    ignores: [
      '**/.next/**',
      '**/out/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
    ],
  },

  // JSON files
  {
    ...jsonConfig,
    files: ['**/*.json'],
  },

  // Apply base configuration to all relevant files
  {
    ...baseConfig,
    files: [
      'apps/**/*.{ts,tsx}',
      'packages/**/*.{ts,tsx}',
      'supabase/functions/**/*.ts',
      'scripts/**/*.mjs',
    ],
  },

  // Note: Next.js app uses its own eslint.config.mjs file

  // Apply React Native specific configuration to the native app
  {
    ...nativeConfig,
    files: ['apps/native/**/*.ts', 'apps/native/**/*.tsx'],
  },

  // Apply generic React library configuration to UI packages
  {
    ...reactLibraryConfig,
    files: ['packages/ui-*/**/*.ts', 'packages/ui-*/**/*.tsx'],
  },

  // Apply Supabase specific configuration to Supabase functions
  {
    ...supabaseConfig,
    files: ['supabase/functions/**/*.ts'],
  },

  // Note: Web app specific rules are handled by apps/web/eslint.config.mjs
];
