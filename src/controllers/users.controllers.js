import {pool} from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET_JWT_KEY } from "../config.js";

export const getUsers = async (req, res) => {
  const {rows} = await pool.query("SELECT * FROM panaderia.usuario");
  res.json(rows);
};

export const getUserId = async (req, res) => {
  const {userId} = req.params;

  const {rows} = await pool.query("SELECT * FROM panaderia.usuario WHERE id_usuario = $1", [userId]);

  if(rows.length === 0){
    return res.status(404).json({message: "Usuario no encontrado"});
  }

  res.json(rows);
};

export const createUser =  async (req, res) => {
  try
  {
    const data = req.body;
    
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const {rows} = await pool.query(
      "INSERT INTO panaderia.usuario (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *", 
      [data.nombre, data.email, hashedPassword, data.rol]
    );
    
    // No retornar la contraseña en la respuesta
    const user = rows[0];
    delete user.contrasena;
    
    return res.json(user);
  }
  catch (error)
  {
    console.error(error);
    if(error.code === '23505'){
      return res.status(409).json({message: "El correo ya está en uso"});
    }
    res.status(500).json({message: "Error del servidor"});
  }  
};

export const deleteUserId = async (req, res) => {
  const {userId} = req.params;

  const {rowCount} = await pool.query("DELETE FROM panaderia.usuario WHERE id_usuario = $1", [userId]);

  if(rowCount === 0){
    return res.status(404).json({message: "Usuario no encontrado"});
  }

  res.sendStatus(204);
};

export const updateUserId = async (req, res) => {
  try {
    const {userId} = req.params;
    const data = req.body;
    
    // Hashear la contraseña si se está actualizando
    let hashedPassword = data.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }
    
    const {rows} = await pool.query(
      "UPDATE panaderia.usuario SET nombre = $1, correo = $2, contrasena = $3, rol = $4 WHERE id_usuario = $5 RETURNING *", 
      [data.nombre, data.email, hashedPassword, data.rol, userId]
    );
    
    if(rows.length === 0){
      return res.status(404).json({message: "Usuario no encontrado"});
    }
    
    // No retornar la contraseña en la respuesta
    const user = rows[0];
    delete user.contrasena;
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error del servidor"});
  }
};

export const loginUser = async (req, res) => {
  try {
      const {email, password} = req.body; 
      
      // Buscar usuario solo por email
      const result = await pool.query(
        "SELECT * FROM panaderia.usuario WHERE correo = $1", 
        [email]
      );
      
      if(result.rows.length === 0){
          return res.status(401).json({message: "Credenciales inválidas"});
      }
      
      const user = result.rows[0];
      
      // Comparar la contraseña con el hash almacenado
      const isPasswordValid = await bcrypt.compare(password, user.contrasena);
      
      if(!isPasswordValid){
          return res.status(401).json({message: "Credenciales inválidas"});
      }
      
      // Crear token con información relevante del usuario
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          email: user.correo,
          rol: user.rol
        }, 
        SECRET_JWT_KEY, 
        {expiresIn: '1h'}
      );
      
      // No retornar la contraseña en la respuesta
      delete user.contrasena;
      
      res.json({
        message: 'Login exitoso',
        token: token,
        user: user
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({message: "Error del servidor"});
  }
};

export const verifyTokenController = (req, res) => {
  // Si llegamos aquí, el token ya fue verificado por el middleware
  res.json({
    message: "Token válido",
    user: req.user
  });
};

export const logoutUser = (req, res) => {
  // Con JWT, el logout se maneja principalmente del lado del cliente
  // El cliente debe eliminar el token de su almacenamiento (localStorage, sessionStorage, etc.)
  // Aquí simplemente confirmamos el logout y retornamos un mensaje
  
  // Si llegamos aquí, el token fue verificado por el middleware
  // Esto asegura que solo usuarios autenticados puedan hacer logout
  
  res.json({
    message: "Logout exitoso. Por favor elimina el token del cliente.",
    user: req.user.email
  });
};