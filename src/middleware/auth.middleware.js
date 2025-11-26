import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config.js";

export const verifyToken = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // El formato esperado es: "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    
    // Adjuntar la información del usuario al request
    req.user = decoded;
    
    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    return res.status(500).json({ message: "Error al verificar token" });
  }
};
