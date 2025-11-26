# Guía de Despliegue - API REST con JWT

## Requisitos Previos

1. **Node.js** (versión 18 o superior)
   - Verifica: `node --version`
   - Descarga: https://nodejs.org/

2. **PostgreSQL** (versión 12 o superior)
   - Verifica: `psql --version`
   - Descarga: https://www.postgresql.org/download/

3. **Git** (opcional, para clonar el repositorio)
   - Verifica: `git --version`
   - Descarga: https://git-scm.com/

---

## Pasos de Instalación

### Paso 1: Obtener el Código

#### Clonar desde Git
```bash
git clone <url-del-repositorio>
cd APIREST_NodeJS
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `express` - Framework web
- `pg` - Cliente de PostgreSQL
- `jsonwebtoken` - Manejo de JWT
- `bcrypt` - Hashing de contraseñas
- `morgan` - Logger de peticiones HTTP

---

### Paso 3: Configurar la Base de Datos

#### Usar el script SQL 

```bash
# Conectarse a PostgreSQL y ejecutar el script
psql -U postgres -d postgres -f database/db.sql
```

#### Verificar la instalación

```sql
-- Ver las tablas creadas
\dt panaderia.*

-- Ver la estructura de la tabla
\d panaderia.usuario
```

Deberías ver:
```
Schema   | Name    | Type  | Owner
---------|---------|-------|--------
panaderia| usuario | table | postgres
```

---

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:
Edita el archivo `.env` con tus credenciales:

```env
# Configuración de la Base de Datos
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_contraseña_de_postgresql
DB_DATABASE=nombre_de_tu_bd
DB_PORT=5432

# Configuración del Servidor
PORT=3000

# Clave Secreta para JWT
SECRET_JWT_KEY=tsecretKey
```

### Paso 5: Iniciar el Servidor

#### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

Output:
```
Server on port 3000
```