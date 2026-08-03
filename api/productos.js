import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  // Permitir CORS por si tu frontend y tu bot consultan desde otro lado
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. OBTENER productos (Lo usa tu web de React)
  if (req.method === 'GET') {
    try {
      // Asegurémonos de que la tabla exista por si acaso
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS productos (
          id TEXT PRIMARY KEY,
          titulo TEXT NOT NULL,
          precio REAL NOT NULL,
          categoria TEXT
        )
      `);

      const result = await turso.execute("SELECT * FROM productos");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener productos", details: error.message });
    }
  }

  // 2. CREAR o ACTUALIZAR producto (Lo usa tu bot de Telegram)
  if (req.method === 'POST') {
    try {
      const { id, titulo, precio, categoria } = req.body;

      if (!id || !titulo || !precio) {
        return res.status(400).json({ error: "Faltan datos obligatorios (id, titulo, precio)" });
      }

      await turso.execute({
        sql: `INSERT INTO productos (id, titulo, precio, categoria) 
              VALUES (?, ?, ?, ?) 
              ON CONFLICT(id) DO UPDATE SET titulo = ?, precio = ?, categoria = ?`,
        args: [id, titulo, precio, categoria || "", titulo, precio, categoria || ""],
      });

      return res.status(200).json({ success: true, message: "Producto guardado correctamente" });
    } catch (error) {
      return res.status(500).json({ error: "Error al guardar el producto", details: error.message });
    }
  }

  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}