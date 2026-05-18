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

    exp_docente TEXT,
    cantidad_exp_docente INTEGER,

    exp_profesional TEXT,
    cantidad_exp_profesional INTEGER,

    exp_clinica TEXT,
    cantidad_exp_clinica INTEGER,

    proy_investigacion TEXT,
    cantidad_proy_investigacion INTEGER,

    proy_social TEXT,
    cantidad_proy_social INTEGER,

    exp_academico_admin TEXT,
    cantidad_exp_academico_admin INTEGER,

    libro_editorial TEXT,
    cantidad_libro_editorial INTEGER,

    patente TEXT,
    cantidad_patente INTEGER,

    capitulo_libro TEXT,
    cantidad_capitulo_libro INTEGER,

    articulo_a1 TEXT,
    cantidad_articulo_a1 INTEGER,

    articulo_a2 TEXT,
    cantidad_articulo_a2 INTEGER,

    articulo_b TEXT,
    cantidad_articulo_b INTEGER,

    articulo_c TEXT,
    cantidad_articulo_c INTEGER,

    evento_internacional TEXT,
    cantidad_evento_internacional INTEGER,

    evento_nacional TEXT,
    cantidad_evento_nacional INTEGER,

    posgrado_laureado TEXT,
    cantidad_posgrado_laureado INTEGER,

    posgrado_meritorio TEXT,
    cantidad_posgrado_meritorio INTEGER,

    pregrado_laureado TEXT,
    cantidad_pregrado_laureado INTEGER,

    pregrado_meritorio TEXT,
    cantidad_pregrado_meritorio INTEGER,

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
      cantidadInglesB2,

      expDocente,
      cantidadExpDocente,

      expProfesional,
      cantidadExpProfesional,

      expClinica,
      cantidadExpClinica,
      
      proyInvestigacion,
      cantidadProyInvestigacion,
      
      proySocial,
      cantidadProySocial,
      
      expAcademicoAdmin,
      cantidadExpAcademicoAdmin,

      libroEditorial,
      cantidadLibroEditorial,

      patente,
      cantidadPatente,

      capituloLibro,
      cantidadCapituloLibro,

      articuloA1,
      cantidadArticuloA1,

      articuloA2,
      cantidadArticuloA2,

      articuloB,
      cantidadArticuloB,

      articuloC,
      cantidadArticuloC,

      eventoInternacional,
      cantidadEventoInternacional,

      eventoNacional,
      cantidadEventoNacional,

      posgradoLaureado,
      cantidadPosgradoLaureado,

      posgradoMeritorio,
      cantidadPosgradoMeritorio,

      pregradoLaureado,
      cantidadPregradoLaureado,

      pregradoMeritorio,
      cantidadPregradoMeritorio
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
        cantidad_ingles_b2,

        exp_docente,
        cantidad_exp_docente,
        
        exp_profesional,
        cantidad_exp_profesional,
        
        exp_clinica,
        cantidad_exp_clinica,
        
        proy_investigacion,
        cantidad_proy_investigacion,
        
        proy_social,
        cantidad_proy_social,
        
        exp_academico_admin,
        cantidad_exp_academico_admin,

        libro_editorial,
        cantidad_libro_editorial,

        patente,
        cantidad_patente,

        capitulo_libro,
        cantidad_capitulo_libro,

        articulo_a1,
        cantidad_articulo_a1,

        articulo_a2,
        cantidad_articulo_a2,

        articulo_b,
        cantidad_articulo_b,

        articulo_c,
        cantidad_articulo_c,

        evento_internacional,
        cantidad_evento_internacional,

        evento_nacional,
        cantidad_evento_nacional,

        posgrado_laureado,
        cantidad_posgrado_laureado,

        posgrado_meritorio,
        cantidad_posgrado_meritorio,

        pregrado_laureado,
        cantidad_pregrado_laureado,

        pregrado_meritorio,
        cantidad_pregrado_meritorio
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
        $19, $20,
        $21, $22,
        $23, $24,
        $25, $26,
        $27, $28,
        $29, $30,
        $31, $32,
        $33, $34,
        $35, $36,
        $37, $38,
        $39, $40,
        $41, $42,
        $43, $44,
        $45, $46,
        $47, $48,
        $49, $50,
        $51, $52,
        $53, $54,
        $55, $56,
        $57, $58,
        $59, $60
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
        numeroONull(cantidadInglesB2),

        expDocente,
        numeroONull(cantidadExpDocente),
        
        expProfesional,
        numeroONull(cantidadExpProfesional),
        
        expClinica,
        numeroONull(cantidadExpClinica),
        
        proyInvestigacion,
        numeroONull(cantidadProyInvestigacion),
        
        proySocial,
        numeroONull(cantidadProySocial),
        
        expAcademicoAdmin,
        numeroONull(cantidadExpAcademicoAdmin),

        libroEditorial,
        numeroONull(cantidadLibroEditorial),

        patente,
        numeroONull(cantidadPatente),

        capituloLibro,
        numeroONull(cantidadCapituloLibro),

        articuloA1,
        numeroONull(cantidadArticuloA1),

        articuloA2,
        numeroONull(cantidadArticuloA2),

        articuloB,
        numeroONull(cantidadArticuloB),

        articuloC,
        numeroONull(cantidadArticuloC),

        eventoInternacional,
        numeroONull(cantidadEventoInternacional),

        eventoNacional,
        numeroONull(cantidadEventoNacional),

        posgradoLaureado,
        numeroONull(cantidadPosgradoLaureado),

        posgradoMeritorio,
        numeroONull(cantidadPosgradoMeritorio),

        pregradoLaureado,
        numeroONull(cantidadPregradoLaureado),

        pregradoMeritorio,
        numeroONull(cantidadPregradoMeritorio)
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

  { header: "Exp. Docente", key: "exp_docente", width: 18 },
  { header: "Cant. Exp. Docente", key: "cantidad_exp_docente", width: 20 },

  { header: "Exp. Profesional", key: "exp_profesional", width: 20 },
  { header: "Cant. Exp. Profesional", key: "cantidad_exp_profesional", width: 22 },

  { header: "Exp. Clínica", key: "exp_clinica", width: 18 },
  { header: "Cant. Exp. Clínica", key: "cantidad_exp_clinica", width: 20 },

  { header: "Proyectos Investigación", key: "proy_investigacion", width: 24 },
  { header: "Cant. Proyectos Investigación", key: "cantidad_proy_investigacion", width: 28 },

  { header: "Proyectos Sociales", key: "proy_social", width: 22 },
  { header: "Cant. Proyectos Sociales", key: "cantidad_proy_social", width: 26 },

  { header: "Exp. Académico-Admin", key: "exp_academico_admin", width: 24 },
  { header: "Cant. Exp. Académico-Admin", key: "cantidad_exp_academico_admin", width: 28 },

  { header: "Libro Editorial", key: "libro_editorial", width: 22 },
  { header: "Cant. Libro Editorial", key: "cantidad_libro_editorial", width: 24 },

  { header: "Patente", key: "patente", width: 18 },
  { header: "Cant. Patente", key: "cantidad_patente", width: 20 },

  { header: "Capítulo Libro", key: "capitulo_libro", width: 22 },
  { header: "Cant. Capítulo Libro", key: "cantidad_capitulo_libro", width: 24 },

  { header: "Artículo A1", key: "articulo_a1", width: 18 },
  { header: "Cant. Artículo A1", key: "cantidad_articulo_a1", width: 20 },

  { header: "Artículo A2", key: "articulo_a2", width: 18 },
  { header: "Cant. Artículo A2", key: "cantidad_articulo_a2", width: 20 },

  { header: "Artículo B", key: "articulo_b", width: 18 },
  { header: "Cant. Artículo B", key: "cantidad_articulo_b", width: 20 },

  { header: "Artículo C", key: "articulo_c", width: 18 },
  { header: "Cant. Artículo C", key: "cantidad_articulo_c", width: 20 },

  { header: "Evento Internacional", key: "evento_internacional", width: 24 },
  { header: "Cant. Evento Internacional", key: "cantidad_evento_internacional", width: 28 },

  { header: "Evento Nacional", key: "evento_nacional", width: 22 },
  { header: "Cant. Evento Nacional", key: "cantidad_evento_nacional", width: 26 },

  { header: "Posgrado Laureado", key: "posgrado_laureado", width: 24 },
  { header: "Cant. Posgrado Laureado", key: "cantidad_posgrado_laureado", width: 28 },

  { header: "Posgrado Meritorio", key: "posgrado_meritorio", width: 24 },
  { header: "Cant. Posgrado Meritorio", key: "cantidad_posgrado_meritorio", width: 28 },

  { header: "Pregrado Laureado", key: "pregrado_laureado", width: 24 },
  { header: "Cant. Pregrado Laureado", key: "cantidad_pregrado_laureado", width: 28 },

  { header: "Pregrado Meritorio", key: "pregrado_meritorio", width: 24 },
  { header: "Cant. Pregrado Meritorio", key: "cantidad_pregrado_meritorio", width: 28 },

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
