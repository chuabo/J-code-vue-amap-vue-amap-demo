module.exports = {
  //路径前缀
  publicPath: "/",
  lintOnSave: true,
  productionSourceMap: false,
  //开发模式反向代理配置，生产模式请使用Nginx部署并配置反向代理
  devServer: {
    disableHostCheck: true,
    port: 80,
    proxy: {
      '/appmaptile': {
		target: 'https://webst01.is.autonavi.com/appmaptile',
        //远程演示服务地址,可用于直接启动项目
        //target: 'https://saber.bladex.vip/api',
        //ws: true,
        //pathRewrite: {
        //  '^/selfUpload': '/'
        //}
      },
	}
  }
}