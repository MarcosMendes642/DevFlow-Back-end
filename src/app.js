const express = require("express");
const cors = require("cors");
const path = require("node:path");
const usuarioRoutes = require("./router/usuario.route");
const projetoRoutes = require("./router/project.route");
const timeRoutes = require("./router/time.route")
BigInt.prototype.toJSON = function () {
  return this.toString()
}

const app = express();

app.use(cors());
app.use(express.json());

// Página de documentação das rotas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "rotas.html"));
});

app.use("/", usuarioRoutes);
app.use("/projetos", projetoRoutes);
app.use("/time", timeRoutes)

module.exports = app;