import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required"
      });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format"
      });
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
  console.error("🔴 JWT ERROR:", error.name, error.message);

  return res.status(401).json({
    success: false,
    message: "Invalid or expired authentication token"
  });
}
};