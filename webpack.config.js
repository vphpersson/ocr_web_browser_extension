const path = require('path');

const config = {
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/env',
                                {
                                    "targets": "last 2 Chrome versions, last 2 Firefox versions"
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    }
};

const background_config = {
    entry: './extension/components/background/background.js',
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname, './dist/components/background')
    },
    ...config
};

const injected_query_results_page_config = {
    entry: './extension/components/content_scripts/query_results_page_injected.js',
    output: {
        filename: 'query_results_page_injected.js',
        path: path.resolve(__dirname, './dist/components/content_scripts')
    },
    ...config
};

module.exports = [background_config, injected_query_results_page_config];
