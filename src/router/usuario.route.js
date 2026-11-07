const express = require("express");
const { criarUsuario, login } = require("../controller/usuario.controller");
const auth = require("../middleware/auth");


const router = express.Router();

router.post("/cadastro", criarUsuario);
router.post("/login", login);

router.get("/perfil", auth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

module.exports = router;