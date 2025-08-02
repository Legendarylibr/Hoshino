const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Node.js polyfills
config.resolver.alias = {
  ...config.resolver.alias,
  'assert': 'assert',
  'buffer': 'buffer',
  'crypto': 'crypto-browserify',
  'stream': 'stream-browserify',
  'util': 'util',
  'process': 'process',
  'path': 'path-browserify',
  'fs': false,
  'os': false,
  'http': false,
  'https': false,
  'url': false,
  'querystring': false,
  'zlib': false,
  'tty': false,
  'net': false,
  'child_process': false,
};

// Add polyfills to the resolver
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'assert': require.resolve('assert'),
  'buffer': require.resolve('buffer'),
  'crypto': require.resolve('crypto-browserify'),
  'stream': require.resolve('stream-browserify'),
  'util': require.resolve('util'),
  'process': require.resolve('process'),
  'path': require.resolve('path-browserify'),
};

module.exports = config; 