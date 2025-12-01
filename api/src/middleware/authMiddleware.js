import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided." })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const userId = decoded.id || decoded.account_id || decoded.user_id || decoded.user
        
        if (!userId) {
            console.error("Token decoded successfully, but no user ID found in payload. Decoded payload:", decoded);
            return res.status(401).json({ error: "Invalid token structure: Missing user ID." });
        }
        
        req.user = { 
            account_id: Number(userId), 
            email: decoded.email
        };

        next()
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ error: "Invalid token. Please log in again." })
    }
}