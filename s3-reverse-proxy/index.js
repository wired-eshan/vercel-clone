const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

app.use('/', (req, res, next) => {
    console.log(`Received request for: ${req.url}`);

    const targetUrl = `https://vercel-like-project.s3.ap-south-1.amazonaws.com`;

    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            const host = req.hostname;
            const subdomain = host.split('.')[0];
            if (path === '/') {
                return `/__outputs/${subdomain}/index.html`;
            }
            return `/__outputs/${subdomain}${path}`;
        },
    });
    console.log(`Proxying request to: ${targetUrl}${req.url}`);
    return proxy(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});