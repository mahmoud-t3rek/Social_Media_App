import rateLimit from "express-rate-limit";


const Limiter= ()=> rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: { error: "game over .......🤣" },
  legacyHeaders: false,
  statusCode: 429,
});

export default Limiter