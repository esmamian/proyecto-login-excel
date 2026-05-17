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
    seccion TEXT,

    doctorado TEXT,
    cantidad_doctorado INTEGER,

    magister TEXT,
    cantidad_magister INTEGER,

    especialista TEXT,
    cantidad_especialista INTEGER,

    pedagogia TEXT,
    cantidad_pedagogia INTEGER,

    pregrado TEXT,
    cantidad_pregrado INTEGER,

    cursos_continuada TEXT,
    cantidad_cursos_continuada INTEGER,

    ingles_c2 TEXT,
    cantidad_ingles_c2 INTEGER,

    ingles_c1 TEXT,
    cantidad_ingles_c1 INTEGER,

    ingles_b2 TEXT,
    cantidad_ingles_b2 INTEGER,

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

// Middleware
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

// Función para convertir valores vacíos a null
function numeroONull(valor) {
  if (valor === "" || valor === undefined || valor === null) {
    return null;
  }

  return Number(valor);
}

// Guardar respuestas
app.post("/guardar-respuestas", auth, async (req, res) => {
  try {
    const {
      seccion,

      doctorado,
      cantidadDoctorado,

      magister,
      cantidadMagister,

      especialista,
      cantidadEspecialista,

      pedagogia,
      cantidadPedagogia,

      pregrado,
      cantidadPregrado,

      cursosContinuada,
      cantidadCursosContinuada,

      inglesC2,
      cantidadInglesC2,

      inglesC1,
      cantidadInglesC1,

      inglesB2,
      cantidadInglesB2
    } = req.body;

    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas (
        usuario,
        seccion,

        doctorado,
        cantidad_doctorado,

        magister,
        cantidad_magister,

        especialista,
        cantidad_especialista,

        pedagogia,
        cantidad_pedagogia,

        pregrado,
        cantidad_pregrado,

        cursos_continuada,
        cantidad_cursos_continuada,

        ingles_c2,
        cantidad_ingles_c2,

        ingles_c1,
        cantidad_ingles_c1,

        ingles_b2,
        cantidad_ingles_b2
      )
      VALUES (
        $1, $2,
        $3, $4,
        $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20
      )`,
      [
        usuario,
        seccion,

        doctorado,
        numeroONull(cantidadDoctorado),

        magister,
        numeroONull(cantidadMagister),

        especialista,
        numeroONull(cantidadEspecialista),

        pedagogia,
        numeroONull(cantidadPedagogia),

        pregrado,
        numeroONull(cantidadPregrado),

        cursosContinuada,
        numeroONull(cantidadCursosContinuada),

        inglesC2,
        numeroONull(cantidadInglesC2),

        inglesC1,
        numeroONull(cantidadInglesC1),

        inglesB2,
        numeroONull(cantidadInglesB2)
      ]
    );

    res.json({
      mensaje: `Respuestas guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas",
      detalle: error.message
    });
  }
});

// Descargar Excel
app.get("/descargar-excel", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT *
      FROM respuestas
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Respuestas");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Sección", key: "seccion", width: 25 },

      { header: "Doctorado", key: "doctorado", width: 15 },
      { header: "Cant. Doctorado", key: "cantidad_doctorado", width: 18 },

      { header: "Magíster", key: "magister", width: 15 },
      { header: "Cant. Magíster", key: "cantidad_magister", width: 18 },

      { header: "Especialista", key: "especialista", width: 18 },
      { header: "Cant. Especialista", key: "cantidad_especialista", width: 20 },

      { header: "Pedagogía", key: "pedagogia", width: 18 },
      { header: "Cant. Pedagogía", key: "cantidad_pedagogia", width: 20 },

      { header: "Pregrado", key: "pregrado", width: 18 },
      { header: "Cant. Pregrado", key: "cantidad_pregrado", width: 20 },

      { header: "Cursos continuada", key: "cursos_continuada", width: 25 },
      { header: "Cant. Cursos", key: "cantidad_cursos_continuada", width: 18 },

      { header: "Inglés C2", key: "ingles_c2", width: 15 },
      { header: "Cant. C2", key: "cantidad_ingles_c2", width: 15 },

      { header: "Inglés C1", key: "ingles_c1", width: 15 },
      { header: "Cant. C1", key: "cantidad_ingles_c1", width: 15 },

      { header: "Inglés B2", key: "ingles_b2", width: 15 },
      { header: "Cant. B2", key: "cantidad_ingles_b2", width: 15 },

      { header: "Fecha", key: "fecha", width: 25 }
    ];

    resultado.rows.forEach(row => {
      hoja.addRow(row);
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
