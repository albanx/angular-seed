
const webpack = require('webpack');
const helpers = require('./helpers');
/*
 * Webpack Plugins
 */
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const AssetsPlugin = require('assets-webpack-plugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');
const dllConfig = require('./webpack.dll.js'); // the settings that are common to prod and dev
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;

/**
 * Webpack Constants
 */
const ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;
const HMR = helpers.hasProcessFlag('hot');
const AOT = helpers.hasNpmFlag('aot');


module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        'polyfills': './src/polyfills.browser.ts',
        'main': AOT ? './src/main.browser.aot.ts' : './src/main.browser.ts'
    },
    output: {
        path: helpers.root('dist/dev'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[file].map',
        chunkFilename: '[id].chunk.js',
        library: 'ac_[name]',
        libraryTarget: 'var',
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
                    },
                    {
                        loader: 'tslint-loader',
                        options: {
                            configFile: 'tslint.json'
                        }
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
            //load css files into DOM from sass dir
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [helpers.root('src', 'sass')]
            },

            //sass loader for .scss files in sass folder, return css to DOM
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
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
            inject: 'head',
            isDevServer: helpers.isWebpackDevServer(),
            HMR: HMR
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

        new ngcWebpack.NgcWebpackPlugin({
            disabled: !AOT,
            tsConfig: helpers.root('tsconfig.webpack.json'),
            resourceOverride: helpers.root('config/resource-override.js')
        }),

        new DllBundlesPlugin({
            bundles: {
                polyfills: [
                    'core-js',
                    {
                        name: 'zone.js',
                        path: 'zone.js/dist/zone.js'
                    },
                    {
                        name: 'zone.js',
                        path: 'zone.js/dist/long-stack-trace-zone.js'
                    },
                ],
                vendor: [
                    '@angular/animations',
                    '@angular/common',
                    '@angular/compiler',
                    '@angular/core',
                    '@angular/forms',
                    '@angular/http',
                    '@angular/platform-browser',
                    '@angular/platform-browser-dynamic',
                    '@angular/platform-server',
                    '@angular/router',
                    'rxjs',
                ]
            },
            dllDir: helpers.root('dll'),
            webpackConfig: dllConfig
        }),

        /**
         * Plugin: AddAssetHtmlPlugin
         * Description: Adds the given JS or CSS file to the files
         * Webpack knows about, and put it into the list of assets
         * html-webpack-plugin injects into the generated html.
         *
         * See: https://github.com/SimenB/add-asset-html-webpack-plugin
         */
        new AddAssetHtmlPlugin([
            {filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`)},
            {filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`)}
        ])
    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
        port: PORT,
        host: HOST,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

    //https://webpack.github.io/docs/configuration.html#node
    node: {
        global: true,
        crypto: 'empty',
        process: true,
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
