const { error } = require("node:console");
const prisma = require("../prisma");

async function criarTime(req, res) {
  const { nome } = req.body;
  const usuid = Number(req.user.id);

  if (!nome || nome.trim() === "")
    return res.status(400).json({ error: "O nome é obrigatorio" });

  try {
    const team = await prisma.$transaction(async (tx) => {
      const novoTime = await tx.team.create({
        data: { tm_nome: nome.trim() },
      });
      await tx.team_member.create({
        data: {
          tm_id_tmm: novoTime.tm_id,
          usu_id_tmm: usuid,
          tmm_role: "owner",
        },
      });
      return novoTime;
    });
    return res.status(201).json({
      message: "Time criado",
      team: {
        tm_id: Number(team.tm_id),
        tm_nome: team.tm_nome,
        tm_created_at: team.tm_created_at,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar time" });
  }
}
// get lista de usuario logado
async function buscarUsuariosDoTime(req, res) {
  const { id } = req.params;

  let timeId;
  try {
    timeId = BigInt(id);
  } catch (error) {
    return res.status(400).json({ error: "ID do time inválido." });
  }

  try {
    const users = await prisma.usuario.findMany({
      where: { team_member: { some: { tm_id_tmm: timeId } } },
      select: {
        usu_id: true,
        usu_name: true,
        usu_email: true,
        usu_avatar_url: true,
        team_member: {
          where: { tm_id_tmm: timeId },
          select: { tmm_role: true },
        },
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar usuários do time." });
  }
}
// Detalhes do time (com membros)
//Edita o nome (só owner)
//Apaga o time (só owner)
//Adiciona membro (só owner/admin)
//Remove membro
module.exports = { criarTime, buscarUsuariosDoTime };
