const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const {RawSource} = require('webpack-sources');
const webpack = require('webpack');


module.exports = {
    entry: {
        'css/admin': '@framework/scss/admin.scss',
        'css/admin-light': '@framework/scss/admin-light.scss',
        'css/admin-page-builder': '@framework/scss/admin-page-builder.scss',
        'css/theme-default': '@framework/scss/theme.scss',
        'js/admin': '@framework/js/admin.js',
        'js/admin-options-images': '@framework/js/admin-options-images.js',
        'js/admin-page-builder': '@framework/js/admin-page-builder.js',
        'js/global': '@framework/js/global.js',
    },
    resolve: {
        alias: {
            '@framework': path.resolve(__dirname, './Assets/'),
        },
        extensions: ['.js', '.scss'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/framework/assets/',
        clean: true,
        sourceMapFilename: '[file].map',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new RemoveEmptyScriptsPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map', // génère dist/js/global.js.map ou dist/css/admin.css.map
            append: (info) => {
                const isCss = info.chunk.name.startsWith('css/');
                const name = info.chunk.name.split('/')[1];
                const route = isCss ? 'css-map' : 'js-map';
                const prefix = isCss ? '/*#' : '//#';
                const suffix = isCss ? ' */' : '';
                return `\n${prefix} sourceMappingURL=/framework/assets/${route}/${name}${suffix}`;
            },
            moduleFilenameTemplate: '[resource-path]',
        }),
    ],
    mode: 'development',
};