const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { PrismaClient } = require("./generated/prisma");

const app = express();
const PORT = 8000;

const prisma = new PrismaClient();

app.use('/', async (req, res, next) => {
    console.log(`Received request for: ${req.url}`);

    const targetUrl = `https://vercel-like-project.s3.ap-south-1.amazonaws.com`;

    const host = req.hostname.split('.')[0];
    const project = await prisma.project.findFirst({
        where: {
            sub_domain: host
        },
        select:{
            id: true
        }
    });
    const subdomain = project.id;

    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: (path, req) => {
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