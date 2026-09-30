const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const rootNodeModules = path.resolve(__dirname, '../node_modules');

/**
 * Metro configuration for Monorepo
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [rootNodeModules],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      rootNodeModules,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
