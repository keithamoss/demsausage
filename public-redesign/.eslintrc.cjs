module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "airbnb/hooks",
    "airbnb-typescript",
    "plugin:react/recommended",
    'plugin:react-hooks/recommended',
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "plugin:import/recommended"

  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  // Specifying Parser
  parser: '@typescript-eslint/parser',
  parserOptions: {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module",
    "tsconfigRootDir": __dirname,
    "project": [
      "./tsconfig.json", './tsconfig.node.json'
    ]
  },
  // Configuring third-party plugins
  plugins: ["react",
    "@typescript-eslint", 'react-refresh'],
  // Resolve imports
  settings: {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json"
      }
    },
    "react": {
      "version": "18.x"
    }
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "linebreak-style": "off",
    // Configure prettier
    "prettier/prettier": [
      "error",
      {
        "printWidth": 120,
        "endOfLine": "lf",
        "singleQuote": true,
        "tabWidth": 2,
        "indentStyle": "space",
        "useTabs": true,
        "trailingComma": "all"
      }
    ],
    "@typescript-eslint/no-unused-vars": "off",
    // Disallow the `any` type.
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "extendDefaults": true,
        "types": {
          "{}": false
        }
      }
    ],
    "react-hooks/exhaustive-deps": 2,
    // Enforce the use of the shorthand syntax.
    "object-shorthand": "error",
    "no-console": "warn",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": [
          "camelCase",
          "snake_case"
        ]
      }
    ],
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-misused-promises": "off"
  }
}
