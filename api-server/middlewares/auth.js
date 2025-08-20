const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'some-secret-key';
const authMiddleware = (req, res, next) => {
    console.log("request body in auth middleware:", req);
    console.log("request cookies in auth middleware:", req.cookies);
    console.log("request token in auth middleware:", req.cookies.token);
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authMiddleware };