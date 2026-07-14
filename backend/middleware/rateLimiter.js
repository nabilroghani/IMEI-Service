const rateLimit = require('express-rate-limit');

// Standard API limiter to prevent basic script abuse (e.g., service lookups)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many API requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for order submissions to block automated spamming
exports.orderSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 submissions per hour
  message: {
    success: false,
    error: 'Submission rate limit exceeded. You can only place up to 5 unlock orders per hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for logins & account creations to prevent brute forcing
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 registration/login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
