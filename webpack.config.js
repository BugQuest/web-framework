const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        'css/admin': './Assets/scss/admin.scss',
        'js/admin': './Assets/js/admin.js',
    },
    output: {
        path: path.resolve(__dirname, '../htdocs/cms/admin/dist'),
        filename: '[name].js', // génère js/admin.js
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader, // extrait en fichier .css
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css', // génère css/admin.css
        }),
    ],
    devtool: 'source-map',
    mode: 'development',
};
