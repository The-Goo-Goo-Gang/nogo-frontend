const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.googoogang.nogo',
        productName: 'NoGo 不围棋',
        win: {
          target: 'portable',
          icon: './public/favicon.ico'
        },
        extraFiles: [
          {
            from: './server',
            to: 'server'
          }
        ]
      },
      preload: 'src/preload.ts'
    }
  }
})
