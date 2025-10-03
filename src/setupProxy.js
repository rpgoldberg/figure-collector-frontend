const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy /api requests to backend, stripping the /api prefix
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:5070',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix
      },
    })
  );

  // Proxy /register-frontend to backend
  app.use(
    '/register-frontend',
    createProxyMiddleware({
      target: 'http://backend:5070',
      changeOrigin: true,
    })
  );

  // Proxy /version to backend
  app.use(
    '/version',
    createProxyMiddleware({
      target: 'http://backend:5070',
      changeOrigin: true,
    })
  );
};
