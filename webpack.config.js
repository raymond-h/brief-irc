module.exports = {
    entry: ['./src/web/index.js', './src/web/index.html'],
    output: {
        path: './public',
        filename: 'index.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            {
                test: /\.html$/,
                loaders: [
                    'file?name=[name].[ext]',
                    'extract',
                    'html?interpolate&attrs[]=link:href&attrs[]=img:src'
                ]
            },
            { test: /\.css$/, loader: 'style!css?modules' }
        ]
    },
    devServer: {
        inline: true,
        host: '0.0.0.0',
        proxy: {
            '/deepstream': {
                target: 'http://localhost:6020',
                ws: true
            }
        }
    }
};
