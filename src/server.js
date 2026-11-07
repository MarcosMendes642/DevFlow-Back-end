const app = require("./app")
require("dotenv").config()

app.listen(3333, ()=> console.log("Servidor ON na porta 3333"))