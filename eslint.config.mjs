import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  // Apply recommended rules for JavaScript and TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Customize rules & options
  {
    languageOptions: {
      globals: {
        // Add browser globals like `window`, `document`, etc.
        ...globals.browser,
      },
    },

    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // Allows for Go style _var ignoring
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-duplicate-imports': 'error',
      'no-constructor-return': 'error',
      'no-promise-executor-return': 'error',
      'prefer-template': 'error',
      'dot-notation': 'error',

      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],

      'object-shorthand': 'error',
      'spaced-comment': 'error',
    },
  },
]
