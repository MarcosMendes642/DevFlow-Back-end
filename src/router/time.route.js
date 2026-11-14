const express = require("express");
const { criarTime, buscarUsuariosDoTime } = require("../controller/time.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/criarTime", auth, criarTime);

router.get("/user/:id", buscarUsuariosDoTime)

module.exports = router
