-- Script para verificar y crear las tablas necesarias
-- Ejecutar este script si hay errores 500 en el API

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS panaderia;

-- Crear tabla de materia_prima si no existe
CREATE TABLE IF NOT EXISTS panaderia.materia_prima (
    id_materia_prima SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    cantidad_disponible DECIMAL(10,2) DEFAULT 0,
    proveedor VARCHAR(100),
    fecha_caducidad DATE,
    minimo DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de movimiento_inventario si no existe
CREATE TABLE IF NOT EXISTS panaderia.movimiento_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_materia_prima INTEGER REFERENCES panaderia.materia_prima(id_materia_prima),
    tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('entrada', 'salida', 'merma')),
    cantidad DECIMAL(10,2) NOT NULL,
    motivo TEXT,
    id_usuario INTEGER,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo si la tabla está vacía
INSERT INTO panaderia.materia_prima (nombre, unidad, cantidad_disponible, proveedor, fecha_caducidad, minimo)
SELECT * FROM (VALUES
    ('Harina de Trigo', 'kg', 45.00, 'Harinas del Centro', '2026-12-31', 10.00),
    ('Azúcar Estándar', 'kg', 4.00, 'Dulces Veracruz', '2027-06-30', 5.00),
    ('Huevo', 'pz', 120.00, 'Granja San José', '2026-02-15', 24.00),
    ('Levadura Fresca', 'kg', 0.80, 'Levaduras Mexicanas', '2026-03-01', 1.00),
    ('Mantequilla', 'kg', 1.50, 'Lácteos del Valle', '2026-02-28', 2.00)
) AS v(nombre, unidad, cantidad_disponible, proveedor, fecha_caducidad, minimo)
WHERE NOT EXISTS (SELECT 1 FROM panaderia.materia_prima LIMIT 1);

-- Mensaje de confirmación
SELECT 'Tablas verificadas y creadas correctamente' AS status;
SELECT COUNT(*) as total_materias_primas FROM panaderia.materia_prima;
