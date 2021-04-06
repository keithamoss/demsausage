// Good how-to guide:
// https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  // Maybe our plugins in extends are doing this for us already? Doesn't seem to do anything.
  // parserOptions: {
  //   ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
  //   sourceType: 'module', // Allows for the use of imports
  //   ecmaFeatures: {
  //     jsx: true, // Allows for the parsing of JSX
  //   },
  // },
  plugins: ['@typescript-eslint', 'mui-unused-classes'],
  extends: [
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
    // Disabled because it slows down eslint quite a bit when saving in VSCode. Sometimes it runs fast, but most of the time it's slow. Could be a TypeScript issue?
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'react-app',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules'],
      },
    },
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Disable <Fragment> => <> replacement. Feel free to change
    'react/jsx-fragments': 'off',
    // Disable prefer default export
    'import/prefer-default-export': 'off',
    // Don't bother us about long lines
    // Note: Couldn't set line length, just off/on. Seemed to think I was using an older version of eslint before the more advanced config options came in. Weird, but didn't bother investigating.
    'max-len': 'off',
    // Because I like spreading props on the PhotoPlaceholder component
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Changes to make Scremsong work after starting from a new CRA app
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/destructuring-assignment': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'react/no-children-prop': 'off',
    'react/prefer-stateless-function': 'off',
    'react/jsx-boolean-value': 'off',
    'import/no-cycle': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/alt-text': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/react-in-jsx-scope': 'off', // Not needed since React 17
  },
}
