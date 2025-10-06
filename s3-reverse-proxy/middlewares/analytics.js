const axios = require("axios");

const analyticsMiddleware = async (req, res, next) => {
  try {
    // const ipAddress = req.ip;
    const ipAddress = "24.48.0.1";
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    console.log("fetch ip geolocation api response: ", response);

    if (response.data.status == "success") {
      const { lat, lon, country, city } = response.data;
      req.analytics = { lat, lon, country, city, ipAddress };
    }
    
  } catch (err) {
    console.log("Failed to fetch ip address ")
  } finally {
    next();
  }
};

module.exports = { analyticsMiddleware };
