const express = require("express");
const { criarTime, buscarUsuariosDoTime, adicionarMembro } = require("../controller/time.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/criarTime", auth, criarTime);
router.post("/adduser/:id", auth, adicionarMembro)

router.get("/user/:id", buscarUsuariosDoTime)

module.exports = router
