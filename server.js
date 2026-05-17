const express = require("express");
const session = require("express-session");
const path = require("path");
const ExcelJS = require("exceljs");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "clave-secreta",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));

// Conexión a PostgreSQL en Render
const pool = new Pool({
  connectionString: process.env.AFILIADOS,
  ssl: {
    rejectUnauthorized: false
  }
});

// Crear tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS respuestas (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    doctorado TEXT,
    maestria TEXT,
    ingles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Tabla respuestas lista");
}).catch(error => {
  console.error("Error creando tabla:", error);
});

// Usuarios del sistema
const usuarios = [
  { usuario: "ana", password: "1234", rol: "estudiante" },
  { usuario: "luis", password: "1234", rol: "estudiante" },
  { usuario: "admin", password: "admin123", rol: "admin" }
];

// Middleware de autenticación
function auth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({
      mensaje: "No autorizado"
    });
  }

  next();
}

// Login
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  const user = usuarios.find(
    u => u.usuario === usuario && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      mensaje: "Usuario o contraseña incorrectos"
    });
  }

  req.session.usuario = {
    usuario: user.usuario,
    rol: user.rol
  };

  res.json({
    mensaje: "Login correcto",
    usuario: user.usuario,
    rol: user.rol
  });
});

// Usuario activo
app.get("/usuario", auth, (req, res) => {
  res.json(req.session.usuario);
});

// Guardar respuestas en PostgreSQL
app.post("/guardar-respuestas", auth, async (req, res) => {
  try {
    const { doctorado, maestria, ingles } = req.body;
    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas 
       (usuario, doctorado, maestria, ingles)
       VALUES ($1, $2, $3, $4)`,
      [usuario, doctorado, maestria, ingles]
    );

    res.json({
      mensaje: `Respuestas guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas"
    });
  }
});

// Descargar Excel solo para administrador
app.get("/descargar-excel", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT 
        usuario, 
        doctorado,
        maestria, 
        ingles, 
        fecha
      FROM respuestas
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Respuestas");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Doctorado", key: "doctorado", width: 15 },
      { header: "Maestría", key: "maestria", width: 15 },
      { header: "Curso de inglés", key: "ingles", width: 20 },
      { header: "Fecha", key: "fecha", width: 25 }
    ];

    resultado.rows.forEach(row => {
      hoja.addRow({
        usuario: row.usuario,
        doctorado: row.doctorado,
        maestria: row.maestria,
        ingles: row.ingles,
        fecha: row.fecha
      });
    });

    hoja.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=respuestas.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generando Excel:", error);

    res.status(500).send("Error generando Excel");
  }
});

// Cerrar sesión
app.post("/logout", auth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        mensaje: "Error cerrando sesión"
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      mensaje: "Sesión cerrada"
    });
  });
});

// Puerto para local y Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
