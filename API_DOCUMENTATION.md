# API REST SysPanAPP
## Descripción

API REST de SysPanAPP desarrollada con Node.js y Express que implementa autenticación completa con JSON Web Tokens (JWT) y seguridad con bcrypt para el hashing de contraseñas.

##  Endpoints Disponibles

### Rutas Públicas (No requieren autenticación)

#### 1. Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "rol": "usuario"
}
```

**Respuesta exitosa (200):**
```json
{
  "id_usuario": 1,
  "nombre": "Test",
  "correo": "Test@example.com",
  "rol": "Panadero"
}
```

**Nota:** La contraseña NO se retorna en la respuesta por seguridad.

---

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nombre": "Test",
    "correo": "test@example.com",
    "rol": "Panadero"
  }
}
```

**Respuesta de error (401):**
```json
{
  "message": "Credenciales inválidas"
}
```

---

### Rutas Protegidas (Requieren autenticación)

Todas las rutas protegidas requieren el header `Authorization` con el token JWT:
Authorization: Bearer <token>


#### 3. Obtener Todos los Usuarios
```http
GET /users
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Test",
    "correo": "test@example.com",
    "contrasena": "$2b$10$...",
    "rol": "Panadero"
  }
]
```

---

#### 4. Obtener Usuario por ID
```http
GET /users/:userId
Authorization: Bearer <token>
```

**Ejemplo:**
```http
GET /users/1
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Test",
    "correo": "Test@example.com",
    "contrasena": "$2b$10$...",
    "rol": "Panadero"
  }
]
```

**Respuesta de error (404):**
```json
{
  "message": "Usuario no encontrado"
}
```

---

#### 5. Actualizar Usuario
```http
PUT /users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Test",
  "email": "Test@example.com",
  "password": "newpassword456",
  "rol": "Administrador"
}
```

**Respuesta exitosa (200):**
```json
{
  "id_usuario": 1,
  "nombre": "Test",
  "correo": "Test@example.com",
  "rol": "Administrador"
}
```

**Nota:** La nueva contraseña será automáticamente hasheada antes de guardarse.

---

#### 6. Eliminar Usuario
```http
DELETE /users/:userId
Authorization: Bearer <token>
```

**Respuesta exitosa (204):** Solo se retorna el código

**Respuesta de error (404):**
```json
{
  "message": "Usuario no encontrado"
}
```

#### 8. Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Logout exitoso. Por favor elimina el token del cliente.",
  "user": "test@example.com"
}
```
Nota:
Con JWT, el logout se maneja principalmente del lado del cliente. El servidor confirma el logout, pero el cliente debe eliminar el token de su almacenamiento local (localStorage, sessionStorage, cookies, etc.). Una vez eliminado el token, el usuario no podrá acceder a rutas protegidas.


### Manejo de Errores

### Errores de Autenticación (401)

```json
{
  "message": "Token no proporcionado"
}
```

```json
{
  "message": "Formato de token inválido"
}
```

```json
{
  "message": "Token expirado"
}
```

```json
{
  "message": "Token inválido"
}
```

### Errores del Servidor (500)

```json
{
  "message": "Error del servidor"
}
```

### Conflictos (409)

```json
{
  "message": "El correo ya está en uso"
}
```

## Mejores Prácticas Implementadas

1. **Hashing de Contraseñas**: Todas las contraseñas se hashean con bcrypt antes de almacenarse
2. **No Exponer Contraseñas**: Las contraseñas nunca se retornan en las respuestas de la API
3. **Tokens con Expiración**: Los tokens JWT expiran después de 1 hora
4. **Middleware de Autenticación**: Protección centralizada de rutas
5. **Manejo de Errores**: Respuestas de error claras y específicas
6. **Validación de Tokens**: Verificación completa con manejo de tokens expirados e inválidos
