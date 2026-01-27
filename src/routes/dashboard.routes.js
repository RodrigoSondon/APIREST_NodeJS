import { Router } from "express";
import {
  getDashboardSummary,
  getReporteVentas,
  getReporteCostos,
  getReporteMermas,
  getInsumosUsados,
  getMargenGanancia,
  exportReportePDF,
  exportReporteExcel
} from "../controllers/dashboard.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// ============================================
// Rutas de Dashboard
// ============================================

// Resumen general del dashboard
router.get("/dashboard/summary", verifyToken, getDashboardSummary);

// Reporte de ventas
router.get("/dashboard/ventas", verifyToken, getReporteVentas);

// Reporte de costos
router.get("/dashboard/costos", verifyToken, getReporteCostos);

// Reporte de mermas
router.get("/dashboard/mermas", verifyToken, getReporteMermas);

// Insumos más usados
router.get("/dashboard/insumos-usados", verifyToken, getInsumosUsados);

// Margen de ganancia por producto
router.get("/dashboard/margen-ganancia", verifyToken, getMargenGanancia);

// ============================================
// Rutas de Exportación
// ============================================

// Exportar reporte a PDF
router.get("/dashboard/export/pdf", verifyToken, exportReportePDF);

// Exportar reporte a Excel
router.get("/dashboard/export/excel", verifyToken, exportReporteExcel);

export default router;
