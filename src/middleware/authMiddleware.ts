import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type TokenPayload } from "../lib/jwt.js";
import { errorResponse } from "../lib/response.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json(errorResponse("UNAUTHORIZED", "Authorization header missing"));
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json(errorResponse("UNAUTHORIZED", "Access token missing"));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json(errorResponse("TOKEN_EXPIRED", "Access token has expired"));
    } else {
      res.status(403).json(errorResponse("INVALID_TOKEN", "Invalid access token"));
    }
  }
};

// Middleware to check if user is a listener
export const requireListener = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "LISTENER") {
    res
      .status(403)
      .json(
        errorResponse(
          "FORBIDDEN",
          "This endpoint requires listener role"
        )
      );
    return;
  }
  next();
};
