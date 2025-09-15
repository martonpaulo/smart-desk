module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@smart-desk/types': '../../packages/types/src',
            '@smart-desk/store': '../../packages/store/src',
            src: './src',
          },
        },
      ],
    ],
  };
};
