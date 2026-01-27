CREATE TABLE IF NOT EXISTS panaderia.producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    proveedor VARCHAR(100),
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    minimo DECIMAL(10, 2) NOT NULL DEFAULT 5,
    unidad VARCHAR(20) NOT NULL DEFAULT 'pz',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_producto_updated_at
    BEFORE UPDATE ON panaderia.producto
    FOR EACH ROW
    EXECUTE FUNCTION panaderia.update_updated_at_column();
