Nota del autor: este documento fue actualizado manualmente el 29 de octubre de 2025 para clarificar la instalación y las variables de entorno de la API.
Cambios principales: se corrigieron ejemplos de `.env`, se aclararon comandos de instalación y se añadieron notas de seguridad.

Finanzas API (scaffold)

Pequeña API Express para conectar con PostgreSQL (útil para exponer datos de `transacciones`).

1. Instalación

```powershell
cd api
npm install
```

2. Configurar variables de entorno

Copiar `.env.example` a `.env` y poner tu cadena de conexión. Nunca subas `.env` al repositorio.

Ejemplo `.env`:

```
DATABASE_URL=postgresql://admin:ExEFmALn1ScOcsjPafDVezTWmREEYuGU@dpg-d3smah0dl3ps73aobilg-a.oregon-postgres.render.com/dbfinanzas_13jg
NODE_ENV=production
PORT=4000
```

3. Ejecutar

```powershell
npm run dev
```

4. Endpoints

- GET /transacciones
- GET /transacciones/:id
- POST /transacciones
- PUT /transacciones/:id
- DELETE /transacciones/:id

Notas: este scaffold asume una tabla `transacciones` con columnas mínimas: id (serial/uuid), descripcion (text), monto (numeric), tipo (text) y fecha (timestamp).
