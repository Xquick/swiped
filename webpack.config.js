const path = require('path');
var libraryName = 'Swiped';

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    mode: 'development',
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
    output: {
        filename: 'swiped-ts.js',
        path: path.resolve(__dirname, 'dist'),
        library: libraryName,
        libraryTarget: 'umd'
    }
};