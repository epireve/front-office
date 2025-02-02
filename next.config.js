const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.plugins.push(new MiniCssExtractPlugin());
    
    // Find and modify the CSS rule
    const cssRule = config.module.rules.find(
      (rule) => rule.test && rule.test.toString().includes('.css')
    );
    
    if (cssRule) {
      cssRule.use = [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
            },
          },
        },
        'postcss-loader',
      ];
    }
    
    return config;
  },
};

module.exports = nextConfig;