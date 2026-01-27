-- ============================================
-- Script de Migración de Inventario
-- API REST con JWT - SysPanAPP
-- ============================================

-- Crear tabla de materias primas
CREATE TABLE IF NOT EXISTS panaderia.materia_prima (
    id_materia_prima SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad VARCHAR(20) NOT NULL DEFAULT 'kg',
    cantidad_disponible DECIMAL(10, 2) NOT NULL DEFAULT 0,
    proveedor VARCHAR(100),
    fecha_caducidad DATE,
    minimo DECIMAL(10, 2) NOT NULL DEFAULT 5,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_materia_prima_nombre ON panaderia.materia_prima(nombre);
CREATE INDEX IF NOT EXISTS idx_materia_prima_activo ON panaderia.materia_prima(activo);

-- Crear trigger para actualizar updated_at en materia_prima
DROP TRIGGER IF EXISTS update_materia_prima_updated_at ON panaderia.materia_prima;
CREATE TRIGGER update_materia_prima_updated_at
    BEFORE UPDATE ON panaderia.materia_prima
    FOR EACH ROW
    EXECUTE FUNCTION panaderia.update_updated_at_column();

-- Crear tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS panaderia.movimiento_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_materia_prima INTEGER NOT NULL REFERENCES panaderia.materia_prima(id_materia_prima),
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'merma')),
    cantidad DECIMAL(10, 2) NOT NULL,
    motivo VARCHAR(255),
    id_usuario INTEGER REFERENCES panaderia.usuario(id_usuario),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para movimientos
CREATE INDEX IF NOT EXISTS idx_movimiento_materia_prima ON panaderia.movimiento_inventario(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON panaderia.movimiento_inventario(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON panaderia.movimiento_inventario(fecha_movimiento);

-- Crear función para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION panaderia.actualizar_stock_materia_prima()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_movimiento = 'entrada' THEN
        UPDATE panaderia.materia_prima
        SET cantidad_disponible = cantidad_disponible + NEW.cantidad
        WHERE id_materia_prima = NEW.id_materia_prima;
    ELSIF NEW.tipo_movimiento IN ('salida', 'merma') THEN
        UPDATE panaderia.materia_prima
        SET cantidad_disponible = cantidad_disponible - NEW.cantidad
        WHERE id_materia_prima = NEW.id_materia_prima;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Crear trigger para actualizar stock automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON panaderia.movimiento_inventario;
CREATE TRIGGER trigger_actualizar_stock
    AFTER INSERT ON panaderia.movimiento_inventario
    FOR EACH ROW
    EXECUTE FUNCTION panaderia.actualizar_stock_materia_prima();

-- Crear vista para materias primas críticas
CREATE OR REPLACE VIEW panaderia.materias_primas_criticas AS
SELECT 
    id_materia_prima,
    nombre,
    cantidad_disponible,
    minimo,
    unidad,
    proveedor,
    (minimo - cantidad_disponible) as faltante
FROM panaderia.materia_prima
WHERE cantidad_disponible <= minimo AND activo = TRUE;

-- Crear vista para reporte de movimientos
CREATE OR REPLACE VIEW panaderia.reporte_movimientos AS
SELECT 
    m.id_movimiento,
    m.fecha_movimiento,
    m.tipo_movimiento,
    m.cantidad,
    m.motivo,
    mp.nombre as materia_prima,
    mp.unidad,
    u.nombre as usuario
FROM panaderia.movimiento_inventario m
JOIN panaderia.materia_prima mp ON m.id_materia_prima = mp.id_materia_prima
LEFT JOIN panaderia.usuario u ON m.id_usuario = u.id_usuario
ORDER BY m.fecha_movimiento DESC;

-- Crear vista para insumos más usados
CREATE OR REPLACE VIEW panaderia.insumos_mas_usados AS
SELECT 
    mp.id_materia_prima,
    mp.nombre,
    mp.unidad,
    SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad ELSE 0 END) as total_usado,
    COUNT(CASE WHEN m.tipo_movimiento = 'salida' THEN 1 END) as numero_usos
FROM panaderia.materia_prima mp
LEFT JOIN panaderia.movimiento_inventario m ON mp.id_materia_prima = m.id_materia_prima
WHERE mp.activo = TRUE
GROUP BY mp.id_materia_prima, mp.nombre, mp.unidad
ORDER BY total_usado DESC;

-- Crear vista para reporte de mermas
CREATE OR REPLACE VIEW panaderia.reporte_mermas AS
SELECT 
    mp.nombre as materia_prima,
    mp.unidad,
    SUM(m.cantidad) as total_merma,
    COUNT(*) as numero_eventos,
    MAX(m.fecha_movimiento) as ultima_merma
FROM panaderia.movimiento_inventario m
JOIN panaderia.materia_prima mp ON m.id_materia_prima = mp.id_materia_prima
WHERE m.tipo_movimiento = 'merma'
GROUP BY mp.id_materia_prima, mp.nombre, mp.unidad
ORDER BY total_merma DESC;

-- Comentarios en las tablas
COMMENT ON TABLE panaderia.materia_prima IS 'Tabla de materias primas del inventario';
COMMENT ON TABLE panaderia.movimiento_inventario IS 'Tabla de movimientos de inventario (entradas, salidas, mermas)';

-- Insertar datos de ejemplo (opcional - comentar si no se desea)
INSERT INTO panaderia.materia_prima (nombre, unidad, cantidad_disponible, proveedor, minimo) VALUES
('Harina de Trigo', 'kg', 45.00, 'Harinas del Centro', 10.00),
('Azúcar Estándar', 'kg', 4.00, 'Dulces Veracruz', 5.00),
('Huevo', 'pz', 120.00, 'Granja San Juan', 50.00),
('Levadura Fresca', 'kg', 0.80, 'Levaduras MX', 0.20),
('Mantequilla', 'kg', 1.50, 'Lácteos del Sur', 2.00)
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración de inventario completada correctamente';
    RAISE NOTICE 'Tablas creadas: materia_prima, movimiento_inventario';
    RAISE NOTICE 'Vistas creadas: materias_primas_criticas, reporte_movimientos, insumos_mas_usados, reporte_mermas';
END $$;
