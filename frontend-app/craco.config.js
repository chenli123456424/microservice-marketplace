module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 解决webpack devServer中间件警告
      if (webpackConfig.devServer) {
        // 将已弃用的onAfterSetupMiddleware和onBeforeSetupMiddleware替换为setupMiddlewares
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        
        // 添加新的setupMiddlewares配置
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          // 在这里添加任何需要的中间件逻辑
          return middlewares;
        };
      }
      return webpackConfig;
    }
  }
};