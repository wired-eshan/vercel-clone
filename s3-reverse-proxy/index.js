const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { PrismaClient } = require("./generated/prisma");
const { analyticsMiddleware } = require("./middlewares/analytics");

const app = express();
const PORT = 8000;

const prisma = new PrismaClient();

app.use(analyticsMiddleware);

app.use("/", async (req, res, next) => {
  console.log(`Received request for: ${req.url}`);

  const targetUrl = `https://vercel-like-project.s3.ap-south-1.amazonaws.com`;

  const host = req.hostname.split(".")[0];
  const project = await prisma.project.findFirst({
    where: {
      subDomain: host,
    },
    select: {
      id: true,
    },
  });
  const subdomain = project.id;

  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      if (path === "/") {
        return `/__outputs/${subdomain}/index.html`;
      }
      return `/__outputs/${subdomain}${path}`;
    },
  });
  console.log(`Proxying request to: ${targetUrl}${req.url}`);

  if (req.analytics) {
    const { lat, lon, country, city } = req.analytics;
    await prisma.analytic.create({
      data: {
        lat: lat.toString(),
        lon: lon.toString(),
        country: country,
        city: city,
        project: { connect: { id: project.id } },
      }
    });
  }

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
