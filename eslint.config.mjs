import {
  baseConfig,
  nextjsConfig,
  nativeConfig,
  reactLibraryConfig,
  supabaseConfig,
  jsonConfig,
} from '@smart-desk/eslint-config';
import gitignore from 'eslint-config-flat-gitignore';

/**
 * @type {import('eslint').Linter.Config[]}
 */

export default [
  gitignore(),

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
      'tooling/**/*.{ts,tsx,js,mjs}',
      'supabase/functions/**/*.ts',
      'scripts/**/*.mjs',
    ],
  },

  // Apply Next.js specific configuration to the web app
  {
    ...nextjsConfig,
    files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
  },

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

  // Specific override: Disallow default exports in web components
  {
    files: ['apps/web/src/components/**/*.{ts,tsx}'], // Adjusted path for clarity
    rules: {
      'import/no-default-export': 'error',
    },
  },
];
