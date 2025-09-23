import jwt from "jsonwebtoken"

export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if it's an admin token (you can customize this logic)
    const isAdmin = decoded.user === process.env.ADMIN_EMAIL || decoded.user === process.env.ADMIN_PHONE

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    req.admin = decoded
    next()
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid token.",
    })
  }
}
