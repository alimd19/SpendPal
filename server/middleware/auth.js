
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(403).json({ error: "No token provided" });
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: "Forbidden: requires role " + role });
  }
  next();
};
