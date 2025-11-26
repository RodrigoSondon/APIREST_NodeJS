-- ============================================
-- Script de Inicialización de Base de Datos
-- API REST con JWT - SysPanAPP
-- ============================================

-- Crear el schema si no existe
CREATE SCHEMA IF NOT EXISTS panaderia;

-- Eliminar la tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS panaderia.usuario CASCADE;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS panaderia.usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_correo ON panaderia.usuario(correo);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON panaderia.usuario(rol);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION panaderia.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_usuario_updated_at ON panaderia.usuario;
CREATE TRIGGER update_usuario_updated_at
    BEFORE UPDATE ON panaderia.usuario
    FOR EACH ROW
    EXECUTE FUNCTION panaderia.update_updated_at_column();

-- Comentarios en la tabla
COMMENT ON TABLE panaderia.usuario IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN panaderia.usuario.id_usuario IS 'ID único del usuario';
COMMENT ON COLUMN panaderia.usuario.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN panaderia.usuario.correo IS 'Correo electrónico único del usuario';
COMMENT ON COLUMN panaderia.usuario.contrasena IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN panaderia.usuario.rol IS 'Rol del usuario (usuario, admin, etc.)';
COMMENT ON COLUMN panaderia.usuario.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN panaderia.usuario.updated_at IS 'Fecha de última actualización';

-- Verificar que la tabla se creó correctamente
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'panaderia' 
  AND table_name = 'usuario'
ORDER BY ordinal_position;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente';
    RAISE NOTICE 'Schema: panaderia';
    RAISE NOTICE 'Tabla: usuario';
END $$;
