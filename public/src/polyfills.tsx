// This must be the first line in src/index.js
// https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill
import "react-app-polyfill/ie11"

// Import any specific polyfills required for legacy browsers
import "core-js/modules/es6.array.find"
import "core-js/modules/es6.array.find-index"
import "core-js/modules/es6.function.name"
import "core-js/modules/es6.math.sign"
import "core-js/modules/es6.math.trunc"
import "core-js/modules/es6.number.is-nan"
import "core-js/modules/es6.object.is-frozen"
import "core-js/modules/es6.object.keys"
import "core-js/modules/es6.string.includes"
import "core-js/modules/es6.string.starts-with"
import "core-js/modules/es7.array.includes"
import "core-js/modules/es7.object.entries"
import "core-js/modules/es7.object.values"
import "raf/polyfill"
import "classlist-polyfill"
