import { pool } from "../db.js";

// ============================================
// CRUD de Materias Primas
// ============================================

/**
 * Obtener todas las materias primas
 * Query params: page, limit, activo
 */
export const getMateriasPrimas = async (req, res) => {
  try {
    const { page = 1, limit = 50, activo = 'true' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = "SELECT * FROM panaderia.materia_prima";
    const params = [];
    
    if (activo !== 'all') {
      query += " WHERE activo = $1";
      params.push(activo === 'true');
    }
    
    query += " ORDER BY nombre ASC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(limit, offset);
    
    const { rows } = await pool.query(query, params);
    
    // Obtener total de registros
    const countQuery = activo !== 'all' 
      ? "SELECT COUNT(*) FROM panaderia.materia_prima WHERE activo = $1"
      : "SELECT COUNT(*) FROM panaderia.materia_prima";
    const countParams = activo !== 'all' ? [activo === 'true'] : [];
    const { rows: countRows } = await pool.query(countQuery, countParams);
    
    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countRows[0].count)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener materias primas" });
  }
};

/**
 * Obtener una materia prima por ID
 */
export const getMateriaPrimaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(
      "SELECT * FROM panaderia.materia_prima WHERE id_materia_prima = $1",
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Materia prima no encontrada" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener materia prima" });
  }
};

/**
 * Crear nueva materia prima
 */
export const createMateriaPrima = async (req, res) => {
  try {
    const { nombre, unidad, cantidad_disponible, proveedor, fecha_caducidad, activo, minimo } = req.body;
    
    // Validaciones
    if (!nombre || !unidad) {
      return res.status(400).json({ message: "Nombre y unidad son requeridos" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO panaderia.materia_prima 
       (nombre, unidad_medida, cantidad_disponible, proveedor, fecha_caducidad, activo, minimo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        nombre, 
        unidad, 
        cantidad_disponible || 0, 
        proveedor || null, 
        fecha_caducidad || null, 
        activo || true,
        minimo || 0
      ]
    );
    
    res.status(201).json({
      message: "Materia prima creada exitosamente",
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ message: "La materia prima ya existe" });
    }
    res.status(500).json({ message: "Error al crear materia prima" });
  }
};

/**
 * Actualizar materia prima
 */
export const updateMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, unidad_medida, proveedor, fecha_caducidad, activo, minimo } = req.body;
    
    // Validaciones
    if (!nombre || !unidad_medida) {
      return res.status(400).json({ message: "Nombre y unidad son requeridos" });
    }
    
    const { rows } = await pool.query(
      `UPDATE panaderia.materia_prima 
       SET nombre = $1, unidad_medida = $2, proveedor = $3, fecha_caducidad = $4, activo = $5, minimo = $6
       WHERE id_materia_prima = $7 
       RETURNING *`,
      [nombre, unidad_medida, proveedor, fecha_caducidad, activo || true, minimo, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Materia prima no encontrada" });
    }
    
    res.json({
      message: "Materia prima actualizada exitosamente",
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar materia prima" });
  }
};

/**
 * Reabastecer materia prima (soft delete)
 */
export const reabastecerMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_disponible } = req.body;

    const { rows } = await pool.query(
      "UPDATE panaderia.materia_prima SET cantidad_disponible = cantidad_disponible + $1 WHERE id_materia_prima = $2 RETURNING *",
      [cantidad_disponible, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Materia prima no encontrada" });
    }

    res.json({
      message: "Materia prima reabastecida exitosamente",
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al reabastecer materia prima" });
  }
};

/**
 * Eliminar materia prima (soft delete)
 */
export const deleteMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(
      "UPDATE panaderia.materia_prima SET activo = FALSE WHERE id_materia_prima = $1 RETURNING *",
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Materia prima no encontrada" });
    }
    
    res.json({
      message: "Materia prima eliminada exitosamente",
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar materia prima" });
  }
};

// ============================================
// Movimientos de Inventario
// ============================================

/**
 * Registrar movimiento de inventario (entrada, salida, merma)
 * El stock se actualiza automáticamente mediante trigger
 */
export const registrarMovimiento = async (req, res) => {
  try {
    const { id_materia_prima, tipo_movimiento, cantidad, motivo } = req.body;
    const id_usuario = req.user?.id_usuario; // Del token JWT
    
    // Validaciones
    if (!id_materia_prima || !tipo_movimiento || !cantidad) {
      return res.status(400).json({ 
        message: "id_materia_prima, tipo_movimiento y cantidad son requeridos" 
      });
    }
    
    if (!['entrada', 'salida', 'merma'].includes(tipo_movimiento)) {
      return res.status(400).json({ 
        message: "tipo_movimiento debe ser: entrada, salida o merma" 
      });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }
    
    // Verificar que la materia prima existe
    const { rows: materiaPrima } = await pool.query(
      "SELECT * FROM panaderia.materia_prima WHERE id_materia_prima = $1 AND activo = TRUE",
      [id_materia_prima]
    );
    
    if (materiaPrima.length === 0) {
      return res.status(404).json({ message: "Materia prima no encontrada o inactiva" });
    }
    
    // Verificar stock suficiente para salidas y mermas
    if ((tipo_movimiento === 'salida' || tipo_movimiento === 'merma') && 
        materiaPrima[0].cantidad_disponible < cantidad) {
      return res.status(400).json({ 
        message: "Stock insuficiente",
        disponible: materiaPrima[0].cantidad_disponible,
        solicitado: cantidad
      });
    }
    
    // Registrar movimiento (el trigger actualizará el stock automáticamente)
    const { rows } = await pool.query(
      `INSERT INTO panaderia.movimiento_inventario 
       (id_materia_prima, tipo_movimiento, cantidad, motivo, id_usuario) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [id_materia_prima, tipo_movimiento, cantidad, motivo || null, id_usuario || null]
    );
    
    // Obtener stock actualizado
    const { rows: stockActualizado } = await pool.query(
      "SELECT cantidad_disponible FROM panaderia.materia_prima WHERE id_materia_prima = $1",
      [id_materia_prima]
    );
    
    res.status(201).json({
      message: "Movimiento registrado exitosamente",
      movimiento: rows[0],
      stock_actualizado: stockActualizado[0].cantidad_disponible
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar movimiento" });
  }
};

/**
 * Obtener historial de movimientos
 * Query params: id_materia_prima, tipo_movimiento, fecha_inicio, fecha_fin, page, limit
 */
export const getMovimientos = async (req, res) => {
  try {
    const { 
      id_materia_prima, 
      tipo_movimiento, 
      fecha_inicio, 
      fecha_fin,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM panaderia.reporte_movimientos WHERE 1=1";
    const params = [];
    let paramCount = 1;
    
    if (id_materia_prima) {
      query += ` AND id_movimiento IN (SELECT id_movimiento FROM panaderia.movimiento_inventario WHERE id_materia_prima = $${paramCount})`;
      params.push(id_materia_prima);
      paramCount++;
    }
    
    if (tipo_movimiento) {
      query += ` AND tipo_movimiento = $${paramCount}`;
      params.push(tipo_movimiento);
      paramCount++;
    }
    
    if (fecha_inicio) {
      query += ` AND fecha_movimiento >= $${paramCount}`;
      params.push(fecha_inicio);
      paramCount++;
    }
    
    if (fecha_fin) {
      query += ` AND fecha_movimiento <= $${paramCount}`;
      params.push(fecha_fin);
      paramCount++;
    }
    
    query += ` ORDER BY fecha_movimiento DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const { rows } = await pool.query(query, params);
    
    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener movimientos" });
  }
};

/**
 * Obtener materias primas con stock crítico
 */
export const getMateriasCriticas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM panaderia.materia_prima WHERE cantidad_disponible <= minimo AND activo = TRUE"
    );
    
    res.json({
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener materias críticas" });
  }
};
