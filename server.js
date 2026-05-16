const express = require("express");
const session = require("express-session");
const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");

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

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(archivoExcel)) {
    await workbook.xlsx.readFile(archivoExcel);
  } else {
    const hoja = workbook.addWorksheet("Respuestas");
    hoja.columns = [
      { header: "Usuario", key: "usuario", width: 20 },
      { header: "Doctorado", key: "doctorado", width: 15 },
      { header: "Maestría", key: "maestria", width: 15 },
      { header: "Curso de inglés", key: "ingles", width: 20 },
      { header: "Fecha", key: "fecha", width: 25 }
    ];
  }

  const hoja = workbook.getWorksheet("Respuestas");

  hoja.addRow({
  usuario: usuario,
  doctorado: doctorado,
  maestria: maestria,
  ingles: ingles,
  fecha: new Date().toLocaleString()
  });

  await workbook.xlsx.writeFile(archivoExcel);
  res.json({ mensaje: `Respuestas guardadas para ${usuario}` });
  //res.json({ mensaje: "Respuestas guardadas correctamente" });
});

app.get("/descargar-excel", auth, (req, res) => {
  if (req.session.usuario.rol !== "admin") {
    return res.status(403).send("Solo el administrador puede descargar");
  }

  if (!fs.existsSync(archivoExcel)) {
    return res.status(404).send("Aún no hay respuestas guardadas");
  }

  res.download(archivoExcel);
});

app.post("/logout", auth, (req, res) => {
  req.session.destroy();
  res.json({ mensaje: "Sesión cerrada" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
