const express = require("express");
const session = require("express-session");
const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");

const { Pool } = require("pg");

const archivoDatos = "respuestas.json";
const app = express();
const archivoExcel = "respuestas.xlsx";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "clave-secreta",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));

const usuarios = [
  { usuario: "ana", password: "1234", rol: "estudiante" },
  { usuario: "luis", password: "1234", rol: "estudiante" },
  { usuario: "admin", password: "admin123", rol: "admin" }
];

function auth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }
  next();
}

app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  const user = usuarios.find(
    u => u.usuario === usuario && u.password === password
  );

  if (!user) {
    return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
  }

  req.session.usuario = user;

  res.json({
    mensaje: "Login correcto",
    rol: user.rol
  });
});

app.get("/usuario", auth, (req, res) => {
  res.json(req.session.usuario);
});

app.post("/guardar-respuestas", auth, async (req, res) => {
  const { doctorado, maestria, ingles } = req.body;

  const usuario = req.session.usuario.usuario;

  let respuestas = [];

  if (fs.existsSync(archivoDatos)) {
    const contenido = fs.readFileSync(archivoDatos, "utf8");
    respuestas = JSON.parse(contenido);
  }

  respuestas.push({
    usuario: usuario,
    doctorado: doctorado,
    maestria: maestria,
    ingles: ingles,
    fecha: new Date().toLocaleString()
  });

  fs.writeFileSync(
    archivoDatos,
    JSON.stringify(respuestas, null, 2)
  );

  res.json({
    mensaje: `Respuesta guardada para ${usuario}. Total registros: ${respuestas.length}`
  });
});

app.get("/descargar-excel", auth, async (req, res) => {
  if (req.session.usuario.rol !== "admin") {
    return res.status(403).send("Solo el administrador puede descargar");
  }

  if (!fs.existsSync(archivoDatos)) {
    return res.status(404).send("Aún no hay respuestas guardadas");
  }

  const contenido = fs.readFileSync(archivoDatos, "utf8");
  const respuestas = JSON.parse(contenido);

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Respuestas");

  hoja.columns = [
    { header: "Usuario", key: "usuario", width: 20 },
    { header: "Doctorado", key: "doctorado", width: 15 },
    { header: "Maestría", key: "maestria", width: 15 },
    { header: "Curso de inglés", key: "ingles", width: 20 },
    { header: "Fecha", key: "fecha", width: 25 }
  ];

  respuestas.forEach(r => {
    hoja.addRow(r);
  });

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
});

app.post("/logout", auth, (req, res) => {
  req.session.destroy();
  res.json({ mensaje: "Sesión cerrada" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
