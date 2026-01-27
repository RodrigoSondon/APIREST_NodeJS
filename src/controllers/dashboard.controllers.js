import { pool } from "../db.js";

// ============================================
// Dashboard Summary
// ============================================

/**
 * Obtener resumen general del dashboard
 */
export const getDashboardSummary = async (req, res) => {
  try {
    // Ventas del día (simulado - se puede conectar con tabla de ventas real)
    const ventasHoy = {
      total: 4250.00,
      variacion: 12 // porcentaje vs día anterior
    };
    
    // Pedidos pendientes (simulado)
    const pedidosPendientes = 8;
    
    let alertas_inventario = 0;
    let total_materias_primas = 0;
    let movimientos_hoy = 0;
    
    try {
      // Intentar obtener alertas de inventario
      const alertasQuery = `
        SELECT COUNT(*) as total 
        FROM panaderia.materia_prima 
        WHERE activo = TRUE 
        AND cantidad_disponible <= minimo
      `;
      const { rows: alertas } = await pool.query(alertasQuery);
      alertas_inventario = parseInt(alertas[0].total) || 0;
    } catch (err) {
      console.log('No se pudo obtener alertas de inventario:', err.message);
    }
    
    try {
      // Materias primas totales
      const { rows: totalMaterias } = await pool.query(
        "SELECT COUNT(*) as total FROM panaderia.materia_prima WHERE activo = TRUE"
      );
      total_materias_primas = parseInt(totalMaterias[0].total) || 0;
    } catch (err) {
      console.log('No se pudo obtener total de materias primas:', err.message);
    }
    
    try {
      // Movimientos del día
      const { rows: movimientosHoy } = await pool.query(
        `SELECT COUNT(*) as total 
         FROM panaderia.movimiento_inventario 
         WHERE DATE(fecha_movimiento) = CURRENT_DATE`
      );
      movimientos_hoy = parseInt(movimientosHoy[0].total) || 0;
    } catch (err) {
      console.log('No se pudo obtener movimientos del día:', err.message);
    }
    
    res.json({
      ventas_dia: ventasHoy,
      pedidos_pendientes: pedidosPendientes,
      alertas_inventario,
      total_materias_primas,
      movimientos_hoy
    });
  } catch (error) {
    console.error('Error en getDashboardSummary:', error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard" });
  }
};

// ============================================
// Reportes de Ventas
// ============================================

/**
 * Obtener reporte de ventas
 * Query params: fecha_inicio, fecha_fin
 */
export const getReporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Datos simulados - en producción se conectaría con tabla de ventas
    const reporteVentas = {
      periodo: {
        inicio: fecha_inicio || new Date().toISOString().split('T')[0],
        fin: fecha_fin || new Date().toISOString().split('T')[0]
      },
      total_ventas: 42500.00,
      total_productos_vendidos: 156,
      ticket_promedio: 272.44,
      ventas_por_dia: [
        { fecha: '2026-01-20', total: 8500.00, productos: 31 },
        { fecha: '2026-01-21', total: 9200.00, productos: 35 },
        { fecha: '2026-01-22', total: 7800.00, productos: 28 },
        { fecha: '2026-01-23', total: 8750.00, productos: 32 },
        { fecha: '2026-01-24', total: 8250.00, productos: 30 }
      ],
      productos_mas_vendidos: [
        { nombre: 'Pan Francés', cantidad: 45, total: 6750.00 },
        { nombre: 'Conchas', cantidad: 38, total: 5700.00 },
        { nombre: 'Bolillos', cantidad: 52, total: 3120.00 }
      ]
    };
    
    res.json(reporteVentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de ventas" });
  }
};

// ============================================
// Reportes de Costos
// ============================================

/**
 * Obtener reporte de costos
 */
export const getReporteCostos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Calcular costos de entradas (compras)
    let query = `
      SELECT 
        DATE(m.fecha_movimiento) as fecha,
        COUNT(*) as total_compras,
        SUM(m.cantidad) as cantidad_total
      FROM panaderia.movimiento_inventario m
      WHERE m.tipo_movimiento = 'entrada'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (fecha_inicio) {
      query += ` AND m.fecha_movimiento >= $${paramCount}`;
      params.push(fecha_inicio);
      paramCount++;
    }
    
    if (fecha_fin) {
      query += ` AND m.fecha_movimiento <= $${paramCount}`;
      params.push(fecha_fin);
      paramCount++;
    }
    
    query += " GROUP BY DATE(m.fecha_movimiento) ORDER BY fecha DESC";
    
    const { rows: compras } = await pool.query(query, params);
    
    // Obtener materias primas más costosas (simulado - se necesitaría campo de precio)
    const { rows: materiasPrimas } = await pool.query(`
      SELECT 
        mp.nombre,
        mp.unidad,
        SUM(CASE WHEN m.tipo_movimiento = 'entrada' THEN m.cantidad ELSE 0 END) as total_comprado
      FROM panaderia.materia_prima mp
      LEFT JOIN panaderia.movimiento_inventario m ON mp.id_materia_prima = m.id_materia_prima
      WHERE mp.activo = TRUE
      GROUP BY mp.id_materia_prima, mp.nombre, mp.unidad
      ORDER BY total_comprado DESC
      LIMIT 10
    `);
    
    res.json({
      periodo: {
        inicio: fecha_inicio || 'Inicio',
        fin: fecha_fin || 'Hoy'
      },
      compras_por_fecha: compras,
      materias_mas_compradas: materiasPrimas,
      resumen: {
        total_eventos_compra: compras.reduce((sum, c) => sum + parseInt(c.total_compras), 0)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de costos" });
  }
};

// ============================================
// Reportes de Mermas
// ============================================

/**
 * Obtener reporte de mermas
 */
export const getReporteMermas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM panaderia.reporte_mermas"
    );
    
    // Calcular total de mermas
    const totalMerma = rows.reduce((sum, item) => sum + parseFloat(item.total_merma), 0);
    
    res.json({
      total_merma_general: totalMerma.toFixed(2),
      total_productos_afectados: rows.length,
      detalle_mermas: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de mermas" });
  }
};

// ============================================
// Insumos Más Usados
// ============================================

/**
 * Obtener insumos más usados
 */
export const getInsumosUsados = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { rows } = await pool.query(
      `SELECT * FROM panaderia.insumos_mas_usados LIMIT $1`,
      [limit]
    );
    
    res.json({
      total_insumos: rows.length,
      insumos: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener insumos más usados" });
  }
};

// ============================================
// Margen de Ganancia
// ============================================

/**
 * Obtener margen de ganancia por producto
 * Nota: Esto requeriría una tabla de productos con costos y precios
 * Por ahora se devuelven datos simulados
 */
export const getMargenGanancia = async (req, res) => {
  try {
    // Datos simulados - en producción se calcularía con tablas reales
    const margenesGanancia = [
      {
        producto: 'Pan Francés',
        precio_venta: 150.00,
        costo_produccion: 85.00,
        margen_bruto: 65.00,
        margen_porcentaje: 43.33
      },
      {
        producto: 'Conchas',
        precio_venta: 150.00,
        costo_produccion: 92.00,
        margen_bruto: 58.00,
        margen_porcentaje: 38.67
      },
      {
        producto: 'Bolillos',
        precio_venta: 60.00,
        costo_produccion: 38.00,
        margen_bruto: 22.00,
        margen_porcentaje: 36.67
      },
      {
        producto: 'Donas',
        precio_venta: 180.00,
        costo_produccion: 105.00,
        margen_bruto: 75.00,
        margen_porcentaje: 41.67
      }
    ];
    
    // Calcular promedio de margen
    const margenPromedio = margenesGanancia.reduce(
      (sum, p) => sum + p.margen_porcentaje, 0
    ) / margenesGanancia.length;
    
    res.json({
      margen_promedio: margenPromedio.toFixed(2),
      total_productos: margenesGanancia.length,
      productos: margenesGanancia
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener margen de ganancia" });
  }
};

// ============================================
// Exportación de Reportes
// ============================================

/**
 * Exportar reporte a PDF
 * Placeholder - requiere librería como pdfkit o puppeteer
 */
export const exportReportePDF = async (req, res) => {
  try {
    res.status(501).json({ 
      message: "Funcionalidad de exportación a PDF en desarrollo",
      nota: "Se implementará con librería pdfkit o puppeteer"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al exportar a PDF" });
  }
};

/**
 * Exportar reporte a Excel
 * Placeholder - requiere librería como exceljs
 */
export const exportReporteExcel = async (req, res) => {
  try {
    res.status(501).json({ 
      message: "Funcionalidad de exportación a Excel en desarrollo",
      nota: "Se implementará con librería exceljs"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al exportar a Excel" });
  }
};
