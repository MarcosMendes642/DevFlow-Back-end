const express = require("express");
const { resumo } = require("../controller/projeto.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/resumo", auth, resumo);

module.exports = router;