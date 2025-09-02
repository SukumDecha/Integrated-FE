import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
// import pluginCypress from 'eslint-plugin-cypress'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    name: 'cypress-tests',
    files: ['cypress/**/*.cy.{js,ts}', '**/*.cy.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.mocha, // ✅ describe, it
        ...globals.browser,
        ...globals.node,
        cy: 'readonly', // ✅ เพิ่ม global "cy",
        Cypress: 'readonly',
        expect: 'readonly'
      },
    },
    // plugins: {
    //   cypress: pluginCypress,
    // },
    // rules: {
    //   ...pluginCypress.configs.recommended.rules,
    // },
  },
])
