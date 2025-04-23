const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = {
    entry: {
        'admin/dist/css/admin': './Assets/scss/admin.scss',
        'admin/dist/css/admin-light': './Assets/scss/admin-light.scss',
        'admin/dist/js/admin': './Assets/js/admin.js',
        'admin/dist/js/admin-options-images': './Assets/js/admin-options-images.js',
        'dist/js/global': './Assets/js/global.js',
    },
    output: {
        path: path.resolve(__dirname, '../../../htdocs/cms'),
        filename: '[name].js',
        clean: true,
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
    ],
    mode: 'development',
    devtool: 'source-map',
};
