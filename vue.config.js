function getVersion() {
    const newDate = new Date()
    const YYYY = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1)
    const MM = month.padStart(2, '0');
    const date = String(newDate.getDate())
    const DD = date.padStart(2, '0');
    // uuid
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    const uid = 'xxxx'.replace(/[x]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return `${YYYY}/${MM}/${DD}-${uid}`
}

const webpack = require('webpack');
const plugins = [
    // Make built date as version
    new webpack.DefinePlugin({
        'VERSION_FROM_WEBPACK': JSON.stringify(getVersion()),
        "BABEL_ENV": process.env.BABEL_ENV
    }),
];
/**
 * Define individual moddlewares
 */
const {  NODE_ENV } = process.env

const path = require('path')
module.exports = {
    // configureWebpack: {
    //     //使用cdn，不想讓webpack打包進去
    //     externals: {
    //         "vue": "Vue",
    //         "normalize":"normalize",
    //         "qs":"qs",
    //         "d3":"d3"
    //     }
    // },
    // publicPath: process.env.NODE_ENV === 'production'? '/efirstWeb/': '/efirstWeb/',
    configureWebpack: config => {
            config.externals = {
                'vue': 'Vue',
            }
    },
    lintOnSave: true,
    runtimeCompiler: true,
    configureWebpack: {
        plugins,
        output: {
            filename: '[name].[hash:8].js'
        },
    },
    transpileDependencies: ['vue-particles'],
    productionSourceMap:false,
    chainWebpack: config => {
        const dir = path.resolve(__dirname, 'src/assets/icons')// 存svg图片路径
        config.module
            .rule('svg-sprite')
            .test(/\.svg$/)
            .include.add(dir).end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({ extract: false }).end()
        config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'), [{ plainSprite: true }])
        config.module.rule('svg').exclude.add(dir)//其他svg loader排除icons目录
    }
}
