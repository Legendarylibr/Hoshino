const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add Node.js polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'assert': require.resolve('assert'),
    'buffer': require.resolve('buffer'),
    'crypto': require.resolve('crypto-browserify'),
    'stream': require.resolve('stream-browserify'),
    'util': require.resolve('util'),
    'process': require.resolve('process'),
    'path': require.resolve('path-browserify'),
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

  // Add plugins to provide globals
  config.plugins = config.plugins || [];
  config.plugins.push(
    new (require('webpack')).ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
    })
  );

  return config;
}; 