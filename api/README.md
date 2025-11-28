Este archivo fue movido a `docs_backup/api/README.md`.
Consulta la carpeta `docs_backup/api/` para ver la documentación completa y los archivos originales.

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
