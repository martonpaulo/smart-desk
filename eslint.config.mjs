import gitignore from 'eslint-config-flat-gitignore';
import globals from 'globals';
import { builtinModules } from 'module';

// Parsers
import typescriptParser from '@typescript-eslint/parser';
import jsonParser from 'jsonc-eslint-parser';

// Plugins
import pluginNext from '@next/eslint-plugin-next';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginTypescript from '@typescript-eslint/eslint-plugin';
import pluginImportSort from 'eslint-plugin-simple-import-sort';
import pluginJson from 'eslint-plugin-json';

// Common ignores
const IGNORES = ['.next/**', 'out/**', 'node_modules/**', 'dist/**', 'build/**'];

// Import sort groups
const IMPORT_SORT_GROUPS = [
  ['^\\u0000'],
  [`^(${builtinModules.join('|')})(/.*|$)`],
  ['^@?\\w'],
  ['^src/'],
  ['^\\.'],
  ['^.+\\.s?css$'],
  ['^.+\\.(png|jpg|jpeg|gif|svg|webp)$'],
];

// Base parser options shared across configs
const BASE_PARSER_OPTIONS = {
  ecmaFeatures: { jsx: true },
  project: true,
};

// Base TypeScript config used for source and supabase code
const baseTsConfig = {
  languageOptions: {
    parser: typescriptParser,
    parserOptions: BASE_PARSER_OPTIONS,
  },
  // Do NOT include plugin module objects here (they cause circular refs when ESLint validates)
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: IMPORT_SORT_GROUPS,
      },
    ],
    'simple-import-sort/exports': 'error',
  },
};

// React specific config — avoid embedding plugin module objects
const reactLibraryConfig = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  },
};

// Supabase globals config (Deno etc)
const supabaseConfig = {
  languageOptions: {
    globals: {
      ...globals.deno,
    },
  },
};

// JSON files config
const jsonConfig = {
  languageOptions: {
    parser: jsonParser,
  },
  rules: {
    'json/*': 'error',
  },
};

/**
 * Final flattened config
/**
 * Final flattened config
 * Order matters: gitignore, global ignores, Next extends, then per-file rules
 */
const config = [
  gitignore(),
  {
    ignores: IGNORES,
  },

  // Register plugins globally
  {
    plugins: {
      '@next/next': pluginNext,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': pluginTypescript,
      'simple-import-sort': pluginImportSort,
      json: pluginJson,
    },
  },
  {
    ...jsonConfig,
    files: ['**/*.json'],
  },

  // Base TypeScript rules applied to project source and supabase
  {
    ...baseTsConfig,
    files: ['src/**/*.{ts,tsx}', 'supabase/**/*.{ts,tsx}'],
  },

  // Add Next and project-specific TypeScript overrides and settings
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: BASE_PARSER_OPTIONS,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'error',
      // keep the project's restricted-imports rule
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Relative imports are not allowed. Use absolute imports with src/* alias instead.',
            },
          ],
        },
      ],
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
  },

  // Supabase functions may need Deno globals
  {
    ...supabaseConfig,
    files: ['supabase/**/*.ts'],
  },

  // React specific rules for UI files
  {
    ...reactLibraryConfig,
    files: ['src/**/*.{tsx,ts}'],
  },
];

export default config;
