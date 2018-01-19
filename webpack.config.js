const path = require('path');

module.exports = {
    entry: './src/swiped-ts.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
    output: {
        filename: 'swiped-ts.js',
        path: path.resolve(__dirname, 'dist')
    }
};