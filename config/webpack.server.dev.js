/**
 * @author: Alban
 */

const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const AssetsPlugin = require('assets-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');

/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const AOT = helpers.hasNpmFlag('aot');
let isProd = true;

module.exports = {
    devtool: 'source-map',
    target: 'node',
    entry: {
        'main': './src/main.server.ts'
    },
    output: {
        path: helpers.root('dist/server'),
        filename: 'main.bundle.js',
        sourceMapFilename: '[file].map'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [helpers.root('src'), helpers.root('node_modules')]
    },
    module: {

        rules: [
            //get angular components css and load to dom as string
            {
                test: /\.css$/,
                use: ['to-string-loader', 'css-loader'],
                exclude: [helpers.root('src', 'sass')]
            },
            //get angular components scss, convert to css and load to dom as string
            {
                test: /\.scss$/,
                use: ['to-string-loader', 'css-loader', 'sass-loader'],
                exclude: [helpers.root('src', 'sass')]
            },
            //Extract CSS files from .src/sass directory to external CSS file
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'}),
                include: [helpers.root('src', 'sass')]
            },

            //Extract and compile SCSS files from .src/sass directory to external CSS file
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['to-string-loader', 'css-loader', 'sass-loader']
                }),
                include: [helpers.root('src', 'sass')]
            },

            {
                test: /\.ts$/,
                use: [
                    { // MAKE SURE TO CHAIN VANILLA JS CODE, I.E. TS COMPILATION OUTPUT.
                        loader: 'ng-router-loader',
                        options: {
                            loader: 'async-import',
                            genDir: 'compiled',
                            aot: AOT
                        }
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: 'tsconfig.server.json'
                        }
                    },
                    {
                        loader: 'angular2-template-loader'
                    }
                ],
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.html$/,
                use: 'raw-loader',
                exclude: [helpers.root('src/index.html')]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: 'file-loader'
            },
            {
                test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
                use: 'file-loader'
            }
        ]

    },

    plugins: [
        new AssetsPlugin({
            path: helpers.root('dist'),
            filename: 'webpack-assets.json',
            prettyPrint: true
        }),
        /**
         * Plugin: ExtractTextPlugin
         * Description: Extracts imported CSS files into external stylesheet
         *
         * See: https://github.com/webpack/extract-text-webpack-plugin
         */
        new ExtractTextPlugin('[name].[contenthash].css'),
        /*
         * Plugin: ForkCheckerPlugin
         * Description: Do type checking in a separate process, so webpack don't need to wait.
         *
         * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
         */
        // new CheckerPlugin(),
        /*
         * Plugin: CommonsChunkPlugin
         * Description: Shares common code between the pages.
         * It identifies common modules and put them into a commons chunk.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
         * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
         */
        // new CommonsChunkPlugin({
        //     name: 'polyfills',
        //     chunks: ['polyfills']
        // }),
        // // This enables tree shaking of the vendor modules
        // new CommonsChunkPlugin({
        //     name: 'vendor',
        //     chunks: ['main'],
        //     minChunks: module => /node_modules/.test(module.resource)
        // }),
        // // Specify the correct order the scripts will be injected in
        // new CommonsChunkPlugin({
        //     name: ['polyfills', 'vendor'].reverse()
        // }),

        /**
         * Plugin: ContextReplacementPlugin
         * Description: Provides context to Angular's use of System.import
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
         * See: https://github.com/angular/angular/issues/11580
         */
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('./src'),
            {}
        ),

        /*
         * Plugin: CopyWebpackPlugin
         * Description: Copy files and directories in webpack.
         *
         * Copies project static assets.
         *
         * See: https://www.npmjs.com/package/copy-webpack-plugin
         */
        new CopyWebpackPlugin([
            {from: 'src/assets', to: 'assets'},
        ]),


        /*
         * Plugin: HtmlWebpackPlugin
         * Description: Simplifies creation of HTML files to serve your webpack bundles.
         * This is especially useful for webpack bundles that include a hash in the filename
         * which changes every compilation.
         *
         * See: https://github.com/ampedandwired/html-webpack-plugin
         */
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            chunksSortMode: 'dependency',
            inject: 'head'
        }),
        /*
         * Plugin: ScriptExtHtmlWebpackPlugin
         * Description: Enhances html-webpack-plugin functionality
         * with different deployment options for your scripts including:
         *
         * See: https://github.com/numical/script-ext-html-webpack-plugin
         */
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        }),
        /**
         * Plugin LoaderOptionsPlugin (experimental)
         *
         * See: https://gist.github.com/sokra/27b24881210b56bbaff7
         */
        new LoaderOptionsPlugin({}),

        // Fix Angular 2
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)async/,
            helpers.root('node_modules/@angular/core/src/facade/async.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)collection/,
            helpers.root('node_modules/@angular/core/src/facade/collection.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)errors/,
            helpers.root('node_modules/@angular/core/src/facade/errors.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)lang/,
            helpers.root('node_modules/@angular/core/src/facade/lang.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)math/,
            helpers.root('node_modules/@angular/core/src/facade/math.js')
        ),

        new ngcWebpack.NgcWebpackPlugin({
            tsConfig: helpers.root('tsconfig.server.json'),
            resourceOverride: helpers.root('config/resource-override.js')
        }),

        new NormalModuleReplacementPlugin(
            /zone\.js(\\|\/)dist(\\|\/)long-stack-trace-zone/,
            helpers.root('config/empty.js')
        ),


        // AoT
        // new NormalModuleReplacementPlugin(
        //   /@angular(\\|\/)upgrade/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /@angular(\\|\/)compiler/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /@angular(\\|\/)platform-browser-dynamic/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /dom(\\|\/)debug(\\|\/)ng_probe/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /dom(\\|\/)debug(\\|\/)by/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /src(\\|\/)debug(\\|\/)debug_node/,
        //   helpers.root('config/empty.js')
        // ),
        // new NormalModuleReplacementPlugin(
        //   /src(\\|\/)debug(\\|\/)debug_renderer/,
        //   helpers.root('config/empty.js')
        // ),

        /**
         * Plugin: CompressionPlugin
         * Description: Prepares compressed versions of assets to serve
         * them with Content-Encoding
         *
         * See: https://github.com/webpack/compression-webpack-plugin
         */
        //  install compression-webpack-plugin
        // new CompressionPlugin({
        //   regExp: /\.css$|\.html$|\.js$|\.map$/,
        //   threshold: 2 * 1024
        // })

        /**
         * Plugin LoaderOptionsPlugin (experimental)
         *
         * See: https://gist.github.com/sokra/27b24881210b56bbaff7
         */
        new LoaderOptionsPlugin({
            debug: true,
            options: {}
        })
    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
        global: true,
        crypto: 'empty',
        process: false,
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
