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

//Tabla Artes

pool.query(`
  CREATE TABLE IF NOT EXISTS respuestas_artes (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    seccion TEXT,

    exposicion TEXT,
    cantidad_exposicion_individual INTEGER,
    cantidad_exposicion_colectiva INTEGER,

    curadurias TEXT,
    cantidad_curadurias_internacional INTEGER,
    cantidad_curadurias_nacional INTEGER,
    cantidad_curadurias_regional INTEGER,

    premios TEXT,
    cantidad_premios_internacional INTEGER,
    cantidad_premios_nacional INTEGER,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Tabla respuestas_artes lista");
}).catch(error => {
  console.error("Error creando tabla artes:", error);
});

//Tabla Diseño
pool.query(`
  CREATE TABLE IF NOT EXISTS respuestas_diseno (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    seccion TEXT,

    obra_diseno TEXT,
    cantidad_obra_diseno_inter INTEGER,
    cantidad_obra_diseno_nal INTEGER,
    cantidad_obra_diseno_reg INTEGER,

    obra_premiada TEXT,
    cantidad_obra_premiada_inter INTEGER,
    cantidad_obra_premiada_nal INTEGER,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Tabla respuestas_diseno lista");
}).catch(error => {
  console.error("Error creando tabla diseño:", error);
});

//Tabla música
pool.query(`
  CREATE TABLE IF NOT EXISTS respuestas_musica (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    seccion TEXT,

    obra_musical TEXT,
    cantidad_obra_musical_inter INTEGER,
    cantidad_obra_musical_nal INTEGER,
    cantidad_obra_musical_reg INTEGER,

    obra_musical_premiada TEXT,
    cantidad_obra_musical_premiada_inter INTEGER,
    cantidad_obra_musical_premiada_nal INTEGER,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Tabla respuestas_musica lista");
}).catch(error => {
  console.error("Error creando tabla música:", error);
});

//Tabla Comunicación Social

pool.query(`
  CREATE TABLE IF NOT EXISTS respuestas_comunicacion (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    seccion TEXT,

    producto_investigacion TEXT,
    cantidad_producto_investigacion_inter INTEGER,
    cantidad_producto_investigacion_nal INTEGER,
    cantidad_producto_investigacion_reg INTEGER,

    producto_comunicacion TEXT,
    cantidad_producto_comunicacion_inter INTEGER,
    cantidad_producto_comunicacion_nal INTEGER,
    cantidad_producto_comunicacion_reg INTEGER,

    premio_periodismo TEXT,
    cantidad_premio_periodismo_inter INTEGER,
    cantidad_premio_periodismo_nal INTEGER,
    cantidad_premio_periodismo_reg INTEGER,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Tabla respuestas_comunicacion lista");
}).catch(error => {
  console.error("Error creando tabla comunicación:", error);
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
        $57, $58
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

//Guardar artes

app.post("/guardar-artes", auth, async (req, res) => {
  try {
    const {
      seccion,

      exposicion,
      cantidadExposicionIndividual,
      cantidadExposicionColectiva,

      curadurias,
      cantidadCuraduriasInternacional,
      cantidadCuraduriasNacional,
      cantidadCuraduriasRegional,

      premios,
      cantidadPremiosInternacional,
      cantidadPremiosNacional
    } = req.body;

    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas_artes (
        usuario,
        seccion,

        exposicion,
        cantidad_exposicion_individual,
        cantidad_exposicion_colectiva,

        curadurias,
        cantidad_curadurias_internacional,
        cantidad_curadurias_nacional,
        cantidad_curadurias_regional,

        premios,
        cantidad_premios_internacional,
        cantidad_premios_nacional
      )
      VALUES (
        $1, $2,
        $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12
      )`,
      [
        usuario,
        seccion,

        exposicion,
        numeroONull(cantidadExposicionIndividual),
        numeroONull(cantidadExposicionColectiva),

        curadurias,
        numeroONull(cantidadCuraduriasInternacional),
        numeroONull(cantidadCuraduriasNacional),
        numeroONull(cantidadCuraduriasRegional),

        premios,
        numeroONull(cantidadPremiosInternacional),
        numeroONull(cantidadPremiosNacional)
      ]
    );

    res.json({
      mensaje: `Respuestas de Artes guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas de Artes:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas de Artes",
      detalle: error.message
    });
  }
});

app.get("/descargar-artes", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT *
      FROM respuestas_artes
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Artes Plásticas");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Sección", key: "seccion", width: 25 },

      { header: "Exposición", key: "exposicion", width: 18 },
      { header: "Cant. Individual", key: "cantidad_exposicion_individual", width: 20 },
      { header: "Cant. Colectiva", key: "cantidad_exposicion_colectiva", width: 20 },

      { header: "Curadurías", key: "curadurias", width: 18 },
      { header: "Curaduría Internacional", key: "cantidad_curadurias_internacional", width: 25 },
      { header: "Curaduría Nacional", key: "cantidad_curadurias_nacional", width: 25 },
      { header: "Curaduría Regional", key: "cantidad_curadurias_regional", width: 25 },

      { header: "Premios", key: "premios", width: 18 },
      { header: "Premios Internacional", key: "cantidad_premios_internacional", width: 25 },
      { header: "Premios Nacional", key: "cantidad_premios_nacional", width: 25 },

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
      "attachment; filename=artes_plasticas.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generando Excel de Artes:", error);
    res.status(500).send("Error generando Excel de Artes");
  }
});

//Guarda Diseño 
app.post("/guardar-diseno", auth, async (req, res) => {
  try {
    const {
      seccion,

      obraDiseno,
      cantidadObraDisenoInter,
      cantidadObraDisenoNal,
      cantidadObraDisenoReg,

      obraPremiada,
      cantidadObraPremiadaInter,
      cantidadObraPremiadaNal
    } = req.body;

    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas_diseno (
        usuario,
        seccion,

        obra_diseno,
        cantidad_obra_diseno_inter,
        cantidad_obra_diseno_nal,
        cantidad_obra_diseno_reg,

        obra_premiada,
        cantidad_obra_premiada_inter,
        cantidad_obra_premiada_nal
      )
      VALUES (
        $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9
      )`,
      [
        usuario,
        seccion,

        obraDiseno,
        numeroONull(cantidadObraDisenoInter),
        numeroONull(cantidadObraDisenoNal),
        numeroONull(cantidadObraDisenoReg),

        obraPremiada,
        numeroONull(cantidadObraPremiadaInter),
        numeroONull(cantidadObraPremiadaNal)
      ]
    );

    res.json({
      mensaje: `Respuestas de Diseño guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas de Diseño:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas de Diseño",
      detalle: error.message
    });
  }
});

app.get("/descargar-diseno", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT *
      FROM respuestas_diseno
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Diseño");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Sección", key: "seccion", width: 25 },

      { header: "Obra diseño", key: "obra_diseno", width: 22 },
      { header: "Obra diseño internacional", key: "cantidad_obra_diseno_inter", width: 28 },
      { header: "Obra diseño nacional", key: "cantidad_obra_diseno_nal", width: 24 },
      { header: "Obra diseño regional-local", key: "cantidad_obra_diseno_reg", width: 28 },

      { header: "Obra premiada", key: "obra_premiada", width: 24 },
      { header: "Premiada internacional", key: "cantidad_obra_premiada_inter", width: 28 },
      { header: "Premiada nacional", key: "cantidad_obra_premiada_nal", width: 24 },

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
      "attachment; filename=diseno.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generando Excel de Diseño:", error);
    res.status(500).send("Error generando Excel de Diseño");
  }
});

//Guarda Música
app.post("/guardar-musica", auth, async (req, res) => {
  try {
    const {
      seccion,

      obraMusical,
      cantidadObraMusicalInter,
      cantidadObraMusicalNal,
      cantidadObraMusicalReg,

      obraMusicalPremiada,
      cantidadObraMusicalPremiadaInter,
      cantidadObraMusicalPremiadaNal
    } = req.body;

    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas_musica (
        usuario,
        seccion,

        obra_musical,
        cantidad_obra_musical_inter,
        cantidad_obra_musical_nal,
        cantidad_obra_musical_reg,

        obra_musical_premiada,
        cantidad_obra_musical_premiada_inter,
        cantidad_obra_musical_premiada_nal
      )
      VALUES (
        $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9
      )`,
      [
        usuario,
        seccion,

        obraMusical,
        numeroONull(cantidadObraMusicalInter),
        numeroONull(cantidadObraMusicalNal),
        numeroONull(cantidadObraMusicalReg),

        obraMusicalPremiada,
        numeroONull(cantidadObraMusicalPremiadaInter),
        numeroONull(cantidadObraMusicalPremiadaNal)
      ]
    );

    res.json({
      mensaje: `Respuestas de Música guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas de Música:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas de Música",
      detalle: error.message
    });
  }
});

app.get("/descargar-musica", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT *
      FROM respuestas_musica
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Música");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Sección", key: "seccion", width: 25 },

      { header: "Obra musical", key: "obra_musical", width: 22 },
      { header: "Obra musical internacional", key: "cantidad_obra_musical_inter", width: 28 },
      { header: "Obra musical nacional", key: "cantidad_obra_musical_nal", width: 24 },
      { header: "Obra musical regional-local", key: "cantidad_obra_musical_reg", width: 28 },

      { header: "Obra musical premiada", key: "obra_musical_premiada", width: 26 },
      { header: "Premiada internacional", key: "cantidad_obra_musical_premiada_inter", width: 28 },
      { header: "Premiada nacional", key: "cantidad_obra_musical_premiada_nal", width: 24 },

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
      "attachment; filename=musica.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generando Excel de Música:", error);
    res.status(500).send("Error generando Excel de Música");
  }
});

//Guarda Comunicación social 

app.post("/guardar-comunicacion", auth, async (req, res) => {
  try {
    const {
      seccion,

      productoInvestigacion,
      cantidadProductoInvestigacionInter,
      cantidadProductoInvestigacionNal,
      cantidadProductoInvestigacionReg,

      productoComunicacion,
      cantidadProductoComunicacionInter,
      cantidadProductoComunicacionNal,
      cantidadProductoComunicacionReg,

      premioPeriodismo,
      cantidadPremioPeriodismoInter,
      cantidadPremioPeriodismoNal,
      cantidadPremioPeriodismoReg
    } = req.body;

    const usuario = req.session.usuario.usuario;

    await pool.query(
      `INSERT INTO respuestas_comunicacion (
        usuario,
        seccion,

        producto_investigacion,
        cantidad_producto_investigacion_inter,
        cantidad_producto_investigacion_nal,
        cantidad_producto_investigacion_reg,

        producto_comunicacion,
        cantidad_producto_comunicacion_inter,
        cantidad_producto_comunicacion_nal,
        cantidad_producto_comunicacion_reg,

        premio_periodismo,
        cantidad_premio_periodismo_inter,
        cantidad_premio_periodismo_nal,
        cantidad_premio_periodismo_reg
      )
      VALUES (
        $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14
      )`,
      [
        usuario,
        seccion,

        productoInvestigacion,
        numeroONull(cantidadProductoInvestigacionInter),
        numeroONull(cantidadProductoInvestigacionNal),
        numeroONull(cantidadProductoInvestigacionReg),

        productoComunicacion,
        numeroONull(cantidadProductoComunicacionInter),
        numeroONull(cantidadProductoComunicacionNal),
        numeroONull(cantidadProductoComunicacionReg),

        premioPeriodismo,
        numeroONull(cantidadPremioPeriodismoInter),
        numeroONull(cantidadPremioPeriodismoNal),
        numeroONull(cantidadPremioPeriodismoReg)
      ]
    );

    res.json({
      mensaje: `Respuestas de Comunicación guardadas correctamente para ${usuario}`
    });

  } catch (error) {
    console.error("Error guardando respuestas de Comunicación:", error);

    res.status(500).json({
      mensaje: "Error guardando respuestas de Comunicación",
      detalle: error.message
    });
  }
});

app.get("/descargar-comunicacion", auth, async (req, res) => {
  try {
    if (req.session.usuario.rol !== "admin") {
      return res.status(403).send("Solo el administrador puede descargar");
    }

    const resultado = await pool.query(`
      SELECT *
      FROM respuestas_comunicacion
      ORDER BY fecha ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Comunicación");

    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Sección", key: "seccion", width: 35 },

      { header: "Producto investigación", key: "producto_investigacion", width: 28 },
      { header: "Inv. Internacional", key: "cantidad_producto_investigacion_inter", width: 22 },
      { header: "Inv. Nacional", key: "cantidad_producto_investigacion_nal", width: 18 },
      { header: "Inv. Regional-Local", key: "cantidad_producto_investigacion_reg", width: 24 },

      { header: "Producto comunicación", key: "producto_comunicacion", width: 30 },
      { header: "Com. Internacional", key: "cantidad_producto_comunicacion_inter", width: 22 },
      { header: "Com. Nacional", key: "cantidad_producto_comunicacion_nal", width: 18 },
      { header: "Com. Regional-Local", key: "cantidad_producto_comunicacion_reg", width: 24 },

      { header: "Premio periodismo", key: "premio_periodismo", width: 25 },
      { header: "Premio Internacional", key: "cantidad_premio_periodismo_inter", width: 24 },
      { header: "Premio Nacional", key: "cantidad_premio_periodismo_nal", width: 20 },
      { header: "Premio Regional-Local", key: "cantidad_premio_periodismo_reg", width: 25 },

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
      "attachment; filename=comunicacion_social_periodismo.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generando Excel de Comunicación:", error);
    res.status(500).send("Error generando Excel de Comunicación");
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
