const { PrismaClient } = require("../generated/prisma");
const axios = require("axios");

const prisma = new PrismaClient();

const analyticsMiddleware = async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    console.log("fetch ip geolocation api response: ", response);

    if (response.data.status == "success") {
      const { lat, lon, country, city } = response.data;
      req.analytics = { lat, lon, country, city };
    }
    
  } catch (err) {
    console.log("Failed to fetch ip address ")
  } finally {
    next();
  }
};

module.exports = { analyticsMiddleware };
