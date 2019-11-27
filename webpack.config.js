const path = require('path');

module.exports = {
    entry: './src/test/barrel.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    }
}