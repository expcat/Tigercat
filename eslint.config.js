import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

const anchoredOverlayConsumerFiles = [
  'packages/react/src/components/{AutoComplete,Cascader,ColorPicker,DatePicker,Dropdown,FormItem,Image,Mentions,Popover,Popconfirm,Select,TimePicker,Tooltip,TreeSelect}.tsx',
  'packages/react/src/components/{DatePicker,TimePicker,Menu}/**/*.{ts,tsx}',
  'packages/vue/src/components/{AutoComplete,Cascader,ColorPicker,DatePicker,Dropdown,FormItem,Image,Mentions,Menu,Popover,Popconfirm,Select,TimePicker,Tooltip,TreeSelect}.ts'
]

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off', // Allow empty interfaces for type aliases
      'no-undef': 'off', // TypeScript handles this
      // ESLint v10 enables this in `recommended`, but it produces false positives
      // for the common `let x = 0; if (...) x = a; else x = b` pattern, where
      // the initial assignment exists to satisfy TS strict initialization.
      'no-useless-assignment': 'off'
    }
  },
  {
    files: ['packages/react/**/*.tsx', 'packages/react/**/*.ts'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    files: anchoredOverlayConsumerFiles,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-dom',
              message: '锚点浮层只能通过共享 overlay adapter 挂载。'
            },
            {
              name: '@expcat/tigercat-core',
              importNames: [
                'applyFloatingStyles',
                'autoUpdateFloating',
                'computeFloatingPosition',
                'isEventOutside'
              ],
              message: '锚点浮层组件不得直接编排低层定位或 dismiss API。'
            },
            {
              name: 'vue',
              importNames: ['Teleport'],
              message: '锚点浮层只能通过共享 overlay adapter 挂载。'
            }
          ],
          patterns: [
            {
              group: ['@floating-ui/*'],
              message: 'Floating UI 只能由共享 overlay adapter 调用。'
            },
            {
              group: ['**/utils/overlay'],
              importNames: [
                'renderBodyPortal',
                'renderVueBodyTeleport',
                'useClickOutside',
                'useEscapeKey',
                'useFloating',
                'useVueClickOutside',
                'useVueEscapeKey',
                'useVueFloating'
              ],
              message: '锚点浮层组件只能调用共享 anchored-overlay adapter。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='addEventListener']",
          message: '锚点浮层关闭事件只能由共享 overlay adapter 绑定。'
        }
      ]
    }
  },
  {
    files: ['**/scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    }
  },
  prettier,
  {
    ignores: ['**/dist/', '**/node_modules/', '**/*.config.js', '**/tokens/*.js']
  }
]
