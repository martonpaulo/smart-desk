const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for the src alias
config.resolver.alias = {
  src: './src',
};

module.exports = config;
