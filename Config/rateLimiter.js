import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: "error",
    message: "Too many requests. Try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
