// backend/middleware/auth.js
const auth = (req, res, next) => {
    // Bypass authentication for now
    next();
  };
  
  module.exports = auth;