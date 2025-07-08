import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded;
    next();
    
  } catch (error) {
    res.status(401).json({ success: true, error: error.message})
  }
};
