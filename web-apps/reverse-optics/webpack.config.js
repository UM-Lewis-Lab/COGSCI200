const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');
const mode = process.env.NODE_ENV || "production";
const dev = mode === "development"

module.exports = {
    mode: mode,
    plugins: [new MiniCssExtractPlugin()],

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader"
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                ],
            },
        ]
    },
    devtool: dev ? "source-map" : false,
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
            watch: true
        },
        compress: true,
        port: 9000,
    },
    resolve: {
        extensions: [".js", ".ts", ".css", ".html"]
    }
};