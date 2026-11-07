const prisma = require("../prisma")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.usu_id.toString(),
      email: usuario.usu_email,
      name: usuario.usu_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function criarUsuario(req, res) {
  try {
    const { name, email, senha } = req.body;
    if (!name || !email || !senha) {
      return res.status(400).json({ erro: "Preencha os campos obrigatórios" });
    }

    const userExistente = await prisma.usuario.findUnique({
      where: { usu_email: email },
    });

    if (userExistente) {
      return res.status(409).json({ erro: "Este e-mail já está em uso" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        usu_name: name,
        usu_email: email,
        usu_senha: hash,
      },
    });

    const token = gerarToken(novoUsuario);

    return res.status(201).json({ token });
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: "Erro ao criar usuário" })
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body
    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha os campos obrigatórios" })
    }

    const userExiste = await prisma.usuario.findUnique({
      where: { usu_email: email },
    })

    const erroLogin = { erro: "Não conseguimos encontrar sua conta com esses dados. Verifique as informações e tente de novo." };

    if (!userExiste) return res.status(401).json(erroLogin)

    const senhaValida = await bcrypt.compare(senha, userExiste.usu_senha);
    if (!senhaValida) {
      return res.status(401).json(erroLogin);
    }

    const token = gerarToken(userExiste);

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: "Erro ao fazer login" })
  }
}

module.exports = { criarUsuario, login }
