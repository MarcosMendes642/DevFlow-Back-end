const prisma = require("../prisma");

async function resumo(req, res) {
  try {
    const userId = BigInt(req.user.id);

    const inicioDoMes = new Date();
    inicioDoMes.setDate(1);
    inicioDoMes.setHours(0, 0, 0, 0);

    const doUsuario = {
      project_member: { some: { usu_id_pjmb: userId } },
    };

    const [total, novosNoMes] = await Promise.all([
      prisma.project.count({
        where: doUsuario,
      }),
      prisma.project.count({
        where: {
          pj_created_at: { gte: inicioDoMes },
          ...doUsuario,
        },
      }),
    ]);

    res.json({ total, novosNoMes });
  }  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Falha ao buscar projetos" });
  }
}

module.exports = { resumo };