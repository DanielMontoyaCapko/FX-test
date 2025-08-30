import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export function generateToken(userId: number, email: string, name: string, role: string): string {
  return jwt.sign(
    { id: userId, email, name, role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Verify user still exists in database
  const user = await storage.getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    apellidos: user.apellidos,
    telefono: user.telefono,
    fechaNacimiento: user.fechaNacimiento,
    pais: user.pais,
    direccion: user.direccion,
    role: user.role,
  };

  next();
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}