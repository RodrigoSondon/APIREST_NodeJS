# API REST para SysPanAPP 🥖

API REST desarrollada con Node.js, Express y PostgreSQL que implementa autenticación completa con JWT (JSON Web Tokens) y seguridad con bcrypt.

## 🚀 Características

- ✅ **Autenticación JWT** - Tokens seguros con expiración
- ✅ **Hashing de Contraseñas** - Bcrypt con salt rounds
- ✅ **Middleware de Protección** - Rutas protegidas automáticamente
- ✅ **PostgreSQL** - Base de datos relacional robusta
- ✅ **API RESTful** - Endpoints bien estructurados
- ✅ **Validación de Tokens** - Manejo completo de errores

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz:
```env
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_contraseña
DB_DATABASE=nombre_bd
DB_PORT=5432
PORT=3000
SECRET_JWT_KEY=tu_clave_secreta_muy_segura
```

### 3. Crear la base de datos
```bash
psql -U postgres -f database/db.sql
```

### 4. Iniciar el servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

## 🔐 Endpoints Principales

### Autenticación (Públicos)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión

### Usuarios (Protegidos)
- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /verify` - Verificar token

## 🧪 Ejemplo de Uso

### Registrar usuario
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "usuario"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Acceder a ruta protegida
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📁 Estructura del Proyecto

```
APIREST_NodeJS/
├── src/
│   ├── controllers/       # Lógica de negocio
│   ├── middleware/        # Middleware de autenticación
│   ├── routes/           # Definición de rutas
│   ├── config.js         # Configuración
│   ├── db.js            # Conexión a BD
│   └── index.js         # Punto de entrada
├── database/
│   └── db.sql           # Script de inicialización
├── .env                 # Variables de entorno
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hashing de contraseñas
- **Morgan** - Logger HTTP

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Tokens JWT con expiración de 1 hora
- Middleware de validación en rutas protegidas
- Variables de entorno para credenciales sensibles
- Validación de errores de token (expirado, inválido, ausente)

## 📝 Scripts Disponibles

```bash
npm start       # Iniciar en producción
npm run dev     # Iniciar en desarrollo con auto-reload
```

## 🐛 Solución de Problemas

### Puerto en uso
```bash
# Cambiar PORT en .env
PORT=3001
```

### Error de conexión a BD
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de JWT
- Verifica que `SECRET_JWT_KEY` esté configurada en `.env`
- Reinicia el servidor después de cambiar `.env`

## 📄 Licencia

ISC

## 👥 Autor

Desarrollado para SysPanAPP

---
