
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
const OptimizeJsPlugin = require('optimize-js-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');
/**
 * Webpack Constants
 */
const ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const AOT = helpers.hasNpmFlag('aot');


module.exports = {
    devtool: 'source-map',
    entry: {
        'polyfills': './src/polyfills.browser.ts',
        'main': AOT ? './src/main.browser.aot.ts' : './src/main.browser.ts'
    },
    output: {
        path: helpers.root('dist'),
        filename: '[name].[chunkhash].bundle.js',
        sourceMapFilename: '[name].[chunkhash].bundle.map',
        chunkFilename: '[id].[chunkhash].chunk.js'

    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [helpers.root('src'), helpers.root('node_modules')]
    },
    module: {

        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
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
                            configFileName: 'tsconfig.webpack.json'
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
            //angular component styles file to string
            {
                test: /\.css$/,
                use: ['to-string-loader', 'css-loader'],
                exclude: [helpers.root('src', 'sass')]
            },
            //to string and sass loader for the scss of angular components. return string
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
        new CheckerPlugin(),
        /*
         * Plugin: CommonsChunkPlugin
         * Description: Shares common code between the pages.
         * It identifies common modules and put them into a commons chunk.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
         * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
         */
        new CommonsChunkPlugin({
            name: 'polyfills',
            chunks: ['polyfills']
        }),
        // This enables tree shaking of the vendor modules
        new CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['main'],
            minChunks: module => /node_modules/.test(module.resource)
        }),
        // Specify the correct order the scripts will be injected in
        new CommonsChunkPlugin({
            name: ['polyfills', 'vendor'].reverse()
        }),

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
            {from: 'src/images', to: 'images'},
            {from: 'src/css'}
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
            disabled: !AOT,
            tsConfig: helpers.root('tsconfig.webpack.json'),
            resourceOverride: helpers.root('config/resource-override.js')
        }),
        /**
         * Webpack plugin to optimize a JavaScript file for faster initial load
         * by wrapping eagerly-invoked functions.
         *
         * See: https://github.com/vigneshshanmugam/optimize-js-plugin
         */

        new OptimizeJsPlugin({
            sourceMap: false
        }),

        /**
         * Plugin: UglifyJsPlugin
         * Description: Minimize all JavaScript output of chunks.
         * Loaders are switched into minimizing mode.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
         */
        // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
        new UglifyJsPlugin({
            // beautify: true, //debug
            // mangle: false, //debug
            // dead_code: false, //debug
            // unused: false, //debug
            // deadCode: false, //debug
            // compress: {
            //   screw_ie8: true,
            //   keep_fnames: true,
            //   drop_debugger: false,
            //   dead_code: false,
            //   unused: false
            // }, // debug
            // comments: true, //debug


            beautify: false, //prod
            output: {
                comments: false
            }, //prod
            mangle: {
                screw_ie8: true
            }, //prod
            compress: {
                screw_ie8: true,
                warnings: false,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
                negate_iife: false // we need this for lazy v8
            },
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
            minimize: true,
            debug: false,
            options: {

                /**
                 * Html loader advanced options
                 *
                 * See: https://github.com/webpack/html-loader#advanced-options
                 */
                // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
                htmlLoader: {
                    minimize: true,
                    removeAttributeQuotes: false,
                    caseSensitive: true,
                    customAttrSurround: [
                        [/#/, /(?:)/],
                        [/\*/, /(?:)/],
                        [/\[?\(?/, /(?:)/]
                    ],
                    customAttrAssign: [/\)?\]?=/]
                },

            }
        }),

        /**
         * Plugin: BundleAnalyzerPlugin
         * Description: Webpack plugin and CLI utility that represents
         * bundle content as convenient interactive zoomable treemap
         *
         * `npm run build:prod -- --env.analyze` to use
         *
         * See: https://github.com/th0r/webpack-bundle-analyzer
         */

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
