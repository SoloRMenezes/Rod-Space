const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'relic_rush.jsx');
const babelPath = path.join(root, 'assets/vendor/offline-6e390bcdb8ee.js');
const outputPath = path.join(root, 'relic_rush.js');
const context = { window: {}, self: {} };

context.globalThis = context;
context.window = context;
context.self = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(babelPath, 'utf8'), context);

const source = fs.readFileSync(sourcePath, 'utf8');
const output = context.Babel.transform(source, {
  presets: [[context.Babel.availablePresets.react, { runtime: 'classic' }]]
}).code;

fs.writeFileSync(outputPath, `${output}\n`);
console.log('Built relic_rush.js from relic_rush.jsx');
