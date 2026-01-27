import { Router } from "express";
import {
  getMateriasPrimas,
  getMateriaPrimaById,
  createMateriaPrima,
  updateMateriaPrima,
  reabastecerMateriaPrima,
  deleteMateriaPrima,
  registrarMovimiento,
  getMovimientos,
  getMateriasCriticas
} from "../controllers/inventory.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// ============================================
// Rutas de Materias Primas (CRUD)
// ============================================

// Obtener todas las materias primas
router.get("/inventory/materias-primas", verifyToken, getMateriasPrimas);

// Obtener materia prima por ID
router.get("/inventory/materias-primas/:id", verifyToken, getMateriaPrimaById);

// Crear nueva materia prima
router.post("/inventory/materias-primas", verifyToken, createMateriaPrima);

// Actualizar materia prima
router.put("/inventory/materias-primas/:id", verifyToken, updateMateriaPrima);

//Reabastecer materia prima (actualizar cantidad)
router.put("/inventory/materias-primas/reabastecer/:id", verifyToken, reabastecerMateriaPrima); 

// Eliminar materia prima (soft delete)
router.delete("/inventory/materias-primas/:id", verifyToken, deleteMateriaPrima);


// ============================================
// Rutas de Movimientos de Inventario
// ============================================

// Registrar movimiento (entrada, salida, merma)
router.post("/inventory/movimientos", verifyToken, registrarMovimiento);

// Obtener historial de movimientos
router.get("/inventory/movimientos", verifyToken, getMovimientos);

// ============================================
// Rutas de Alertas y Reportes
// ============================================

// Obtener materias primas con stock crítico
router.get("/inventory/criticas", verifyToken, getMateriasCriticas);

export default router;
