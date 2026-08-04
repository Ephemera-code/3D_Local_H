import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. OBTENER productos (Lo usa tu web de React y el bot)
  if (req.method === 'GET') {
    try {
      const result = await turso.execute("SELECT * FROM productos");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener productos", details: error.message });
    }
  }

  // 2. CREAR o ACTUALIZAR producto (POST)
  if (req.method === 'POST') {
    try {
      const { id, categoria, nombre, descripcion, precio, precios } = req.body;

      if (!id || !nombre) {
        return res.status(400).json({ error: "Faltan datos obligatorios (id, nombre)" });
      }

      await turso.execute({
        sql: `INSERT INTO productos (id, categoria, nombre, descripcion, precio, precios) 
              VALUES (?, ?, ?, ?, ?, ?) 
              ON CONFLICT(id) DO UPDATE SET categoria = ?, nombre = ?, descripcion = ?, precio = ?, precios = ?`,
        args: [
          id, categoria || "", nombre, descripcion || "", precio !== undefined ? precio : null, precios ? JSON.stringify(precios) : null,
          categoria || "", nombre, descripcion || "", precio !== undefined ? precio : null, precios ? JSON.stringify(precios) : null
        ],
      });

      return res.status(200).json({ success: true, message: "Producto guardado correctamente" });
    } catch (error) {
      return res.status(500).json({ error: "Error al guardar el producto", details: error.message });
    }
  }

  // 3. ACTUALIZAR (Descripción, Nombre, Precios o Precio) - Lo usa el bot con PUT / PATCH
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { id, precio, precios, nombre, descripcion } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Falta el ID del producto" });
      }

      if (descripcion !== undefined) {
        await turso.execute({
          sql: `UPDATE productos SET descripcion = ? WHERE id = ?`,
          args: [descripcion, id],
        });
      } else if (nombre !== undefined) {
        await turso.execute({
          sql: `UPDATE productos SET nombre = ? WHERE id = ?`,
          args: [nombre, id],
        });
      } else if (precios !== undefined) {
        await turso.execute({
          sql: `UPDATE productos SET precios = ? WHERE id = ?`,
          args: [JSON.stringify(precios), id],
        });
      } else if (precio !== undefined) {
        await turso.execute({
          sql: `UPDATE productos SET precio = ? WHERE id = ?`,
          args: [precio, id],
        });
      } else {
        return res.status(400).json({ error: "Faltan datos para actualizar" });
      }

      return res.status(200).json({ success: true, message: "Actualizado correctamente" });
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar", details: error.message });
    }
  }

  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}