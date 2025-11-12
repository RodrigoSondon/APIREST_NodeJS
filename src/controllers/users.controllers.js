import {pool} from "../db.js";

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
    const {rows} = await pool.query("INSERT INTO panaderia.usuario (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *", [data.nombre, data.email, data.password, data.rol]);
    
    return res.json(rows[0]);
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
  const {userId} = req.params;
  const data = req.body;
  const {rows} = await pool.query("UPDATE panaderia.usuario SET nombre = $1, correo = $2, contrasena = $3, rol = $4 WHERE id_usuario = $5 RETURNING *", [data.nombre, data.email, data.password, data.rol, userId]);
  if(rows.length === 0){
    return  res.status(404).json({message: "Usuario no encontrado"});
  }
  res.json(rows[0]);
};